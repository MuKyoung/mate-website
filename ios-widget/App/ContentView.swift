import SwiftUI
import UIKit

/// 앱 첫 화면 - 로그인 전에는 로그인 칸, 로그인 뒤에는 누구로 들어왔는지 · 오늘 마감 · 위젯 놓는 법
struct ContentView: View {
    @EnvironmentObject private var model: AppModel
    @State private var email = ""
    @State private var password = ""
    @State private var copied = false
    @FocusState private var focus: Field?

    private enum Field { case email, password }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                brand
                if model.signedIn {
                    status
                    if model.widgetCode != nil { link }
                } else {
                    login
                }
                guide
                foot
            }
            .padding(20)
            .frame(maxWidth: 560)
            .frame(maxWidth: .infinity)
        }
        .scrollDismissesKeyboard(.interactively)
        .background(Palette.bg.ignoresSafeArea())
        .task { model.appeared() }
    }

    /* ── 머리 ─────────────────────────────────────── */

    private var brand: some View {
        HStack(spacing: 12) {
            Image(systemName: "calendar.badge.checkmark")
                .font(.system(size: 22, weight: .semibold))
                .foregroundStyle(.white)
                .frame(width: 46, height: 46)
                .background(Color(red: 0x26 / 255, green: 0x44 / 255, blue: 0xCB / 255), in: RoundedRectangle(cornerRadius: 12, style: .continuous))
            VStack(alignment: .leading, spacing: 2) {
                Text("MATE 오늘")
                    .font(.system(size: 22, weight: .bold))
                    .foregroundStyle(Palette.ink)
                Text("오늘이 마감일인 작업을 홈 화면 위젯으로 봅니다")
                    .font(.system(size: 13.5))
                    .foregroundStyle(Palette.sub)
            }
        }
        .padding(.top, 8)
    }

    /* ── 로그인 ───────────────────────────────────── */

    private var login: some View {
        card {
            Text("로그인")
                .font(.system(size: 17, weight: .bold))
                .foregroundStyle(Palette.ink)
            Text("Hub 와 같은 메일 · 비밀번호를 씁니다.")
                .font(.system(size: 13.5))
                .foregroundStyle(Palette.sub)
            TextField("이메일", text: $email)
                .textContentType(.username)
                .keyboardType(.emailAddress)
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled()
                .submitLabel(.next)
                .focused($focus, equals: .email)
                .onSubmit { focus = .password }
                .modifier(FieldStyle())
            SecureField("비밀번호", text: $password)
                .textContentType(.password)
                .submitLabel(.go)
                .focused($focus, equals: .password)
                .onSubmit { submit() }
                .modifier(FieldStyle())
            if let error = model.error {
                Text(error)
                    .font(.system(size: 13.5, weight: .medium))
                    .foregroundStyle(Palette.red)
                    .fixedSize(horizontal: false, vertical: true)
            }
            Button(action: submit) {
                Text(model.busy ? "로그인 중…" : "로그인")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(PrimaryButton())
            .disabled(model.busy)
        }
    }

    private func submit() {
        focus = nil
        let mail = email, pass = password
        Task {
            await model.signIn(email: mail, password: pass)
            if model.signedIn { password = "" }
        }
    }

    /* ── 로그인 뒤 ─────────────────────────────────── */

    private var status: some View {
        card {
            Text("\(model.who) 님으로 로그인했습니다")
                .font(.system(size: 17, weight: .bold))
                .foregroundStyle(Palette.ink)
                .fixedSize(horizontal: false, vertical: true)
            Text(model.summary)
                .font(.system(size: 14))
                .foregroundStyle(Palette.sub)
                .fixedSize(horizontal: false, vertical: true)

            if model.team != nil {
                Picker("범위", selection: $model.scope) {
                    Text("내 작업").tag(Scope.mine)
                    Text("팀 전체").tag(Scope.team)
                }
                .pickerStyle(.segmented)

                if model.shown.isEmpty {
                    Text("오늘 마감인 작업이 없습니다")
                        .font(.system(size: 14))
                        .foregroundStyle(Palette.sub)
                        .frame(maxWidth: .infinity, minHeight: 56)
                } else {
                    VStack(spacing: 0) {
                        ForEach(model.shown) { task in
                            row(task)
                            if task.id != model.shown.last?.id {
                                Rectangle().fill(Palette.line).frame(height: 1)
                            }
                        }
                    }
                }
            }

            HStack(spacing: 10) {
                Button("새로 읽기") { Task { await model.reload() } }
                    .buttonStyle(GhostButton())
                Button("Hub 캘린더") { UIApplication.shared.open(Config.calendarURL) }
                    .buttonStyle(GhostButton())
            }
            Button("로그아웃") { Task { await model.signOut() } }
                .buttonStyle(GhostButton())
        }
    }

    /// 누르면 웹 작업 관리에서 그 작업이 열린다
    private func row(_ task: TaskItem) -> some View {
        Button {
            UIApplication.shared.open(Config.taskURL(task.id))
        } label: {
            HStack(spacing: 10) {
                Circle()
                    .fill(Palette.status(task.status))
                    .frame(width: 8, height: 8)
                VStack(alignment: .leading, spacing: 3) {
                    Text(task.title.isEmpty ? "(제목 없음)" : task.title)
                        .font(.system(size: 15, weight: .medium))
                        .foregroundStyle(task.done ? Palette.edge : Palette.ink)
                        .multilineTextAlignment(.leading)
                        .lineLimit(2)
                    HStack(spacing: 6) {
                        Text("MATE-\(task.num)")
                            .foregroundStyle(Palette.sub)
                        Text(task.statusLabel)
                            .foregroundStyle(Palette.status(task.status))
                        if let tag = task.priorityTag {
                            Text(tag).foregroundStyle(Palette.red)
                        }
                    }
                    .font(.system(size: 12, weight: .semibold))
                }
                Spacer(minLength: 0)
            }
            .frame(minHeight: 52)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
    }

    /* ── 앱 그룹이 없는 설치 - 위젯에 넘길 연결 코드 ── */

    private var link: some View {
        card {
            Text("위젯에 로그인 넘기기")
                .font(.system(size: 17, weight: .bold))
                .foregroundStyle(Palette.ink)
            Text("이 설치에서는 앱과 위젯이 로그인을 같이 쓰지 못합니다. 아래 코드를 복사한 뒤, 홈 화면의 위젯을 길게 눌러 위젯 편집의 연결 코드 칸에 붙여 넣어 주세요. 한 번만 하면 됩니다.")
                .font(.system(size: 13.5))
                .foregroundStyle(Palette.sub)
                .fixedSize(horizontal: false, vertical: true)
            Button(copied ? "복사했습니다" : "연결 코드 복사") {
                UIPasteboard.general.string = model.widgetCode
                copied = true
            }
            .buttonStyle(PrimaryButton())
            Text("코드는 이 계정의 로그인입니다. 다른 사람에게 보내지 마세요.")
                .font(.system(size: 12.5))
                .foregroundStyle(Palette.sub)
                .fixedSize(horizontal: false, vertical: true)
        }
    }

    /* ── 위젯 놓는 법 ──────────────────────────────── */

    private var guide: some View {
        card {
            Text("위젯 놓는 법")
                .font(.system(size: 17, weight: .bold))
                .foregroundStyle(Palette.ink)
            step(1, "홈 화면 빈 곳을 길게 누르고, 왼쪽 위의 편집(또는 +)에서 위젯 추가를 누릅니다.")
            step(2, "MATE 오늘을 찾아 크기를 고르고 놓습니다.")
            step(3, "놓은 위젯을 길게 눌러 위젯 편집에서 내 작업과 팀 전체 중 하나를 고릅니다.")
            step(4, "잠금 화면에도 놓을 수 있습니다. 잠금 화면을 길게 눌러 사용자화에서 고릅니다.")
        }
    }

    private func step(_ n: Int, _ text: String) -> some View {
        HStack(alignment: .firstTextBaseline, spacing: 10) {
            Text("\(n)")
                .font(.system(size: 14, weight: .bold))
                .foregroundStyle(Palette.blue)
                .frame(width: 14, alignment: .leading)
            Text(text)
                .font(.system(size: 14.5))
                .foregroundStyle(Palette.ink)
                .lineSpacing(3)
                .fixedSize(horizontal: false, vertical: true)
        }
    }

    /* ── 판 · 설치 기한 ────────────────────────────── */

    private var foot: some View {
        VStack(alignment: .leading, spacing: 6) {
            if let expires = Provision.expires {
                Text("이 설치는 \(Day.deadline(expires))까지 쓸 수 있습니다. 그 전에 PC 에서 같은 방법으로 다시 설치하면 로그인은 그대로 이어집니다.")
                    .foregroundStyle(Provision.expiresSoon ? Palette.red : Palette.sub)
                    .fixedSize(horizontal: false, vertical: true)
            }
            Text("판 \(Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String ?? "")")
                .foregroundStyle(Palette.sub)
        }
        .font(.system(size: 12.5))
        .padding(.horizontal, 4)
    }

    private func card<Content: View>(@ViewBuilder _ content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            content()
        }
        .padding(18)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Palette.card, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 14, style: .continuous).stroke(Palette.line, lineWidth: 1))
    }
}

private struct FieldStyle: ViewModifier {
    func body(content: Content) -> some View {
        content
            .font(.system(size: 16))
            .foregroundStyle(Palette.ink)
            .padding(.horizontal, 14)
            .frame(height: 48)
            .background(Palette.card, in: RoundedRectangle(cornerRadius: 10, style: .continuous))
            .overlay(RoundedRectangle(cornerRadius: 10, style: .continuous).stroke(Palette.edge, lineWidth: 1))
    }
}

private struct PrimaryButton: ButtonStyle {
    @Environment(\.isEnabled) private var enabled

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 16, weight: .bold))
            .foregroundStyle(.white)
            .frame(maxWidth: .infinity, minHeight: 48)
            .background(Color(red: 0x26 / 255, green: 0x44 / 255, blue: 0xCB / 255), in: RoundedRectangle(cornerRadius: 10, style: .continuous))
            .opacity(configuration.isPressed || !enabled ? 0.6 : 1)
    }
}

private struct GhostButton: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 15, weight: .semibold))
            .foregroundStyle(Palette.ink)
            .frame(maxWidth: .infinity, minHeight: 46)
            .background(Palette.card, in: RoundedRectangle(cornerRadius: 10, style: .continuous))
            .overlay(RoundedRectangle(cornerRadius: 10, style: .continuous).stroke(Palette.edge, lineWidth: 1))
            .opacity(configuration.isPressed ? 0.6 : 1)
    }
}

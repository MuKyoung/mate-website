package kr.co.devteammate.today;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.view.inputmethod.EditorInfo;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;

import java.util.List;

/**
 * 앱 첫 화면 - 로그인 전에는 로그인 칸, 로그인 뒤에는 누구로 들어왔는지와 오늘 마감 건수 · 위젯 놓는 법.
 * 서버와 주고받는 일은 화면을 멈추지 않게 뒤에서 한다.
 */
public class MainActivity extends Activity {
    /** 위젯의 '눌러서 업데이트'로 열었다 */
    static final String ACTION_UPDATE = "kr.co.devteammate.today.ACTION_UPDATE";
    /** 앱 화면이 떠 있나 - 떠 있으면 UpdateReceiver 가 안드로이드의 업데이트 확인 창을 바로 연다 */
    static volatile boolean visible;
    private static MainActivity current;

    private View loginGroup, statusGroup, updateGroup;
    private EditText email, password;
    private Button login, update;
    private TextView loginError, who, today, updateText, version;
    private boolean updating;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        loginGroup = findViewById(R.id.login_group);
        statusGroup = findViewById(R.id.status_group);
        email = findViewById(R.id.email);
        password = findViewById(R.id.password);
        login = findViewById(R.id.login);
        loginError = findViewById(R.id.login_error);
        who = findViewById(R.id.who);
        today = findViewById(R.id.today);
        updateGroup = findViewById(R.id.update_group);
        updateText = findViewById(R.id.update_text);
        update = findViewById(R.id.update);
        version = findViewById(R.id.version);
        update.setOnClickListener(v -> installUpdate());

        login.setOnClickListener(v -> signIn());
        password.setOnEditorActionListener((v, actionId, event) -> {
            if (actionId != EditorInfo.IME_ACTION_DONE) return false;
            signIn();
            return true;
        });
        findViewById(R.id.refresh).setOnClickListener(v -> {
            TodayWidgetProvider.refreshAll(this);
            loadToday();
        });
        findViewById(R.id.open_web).setOnClickListener(v -> openWeb());
        findViewById(R.id.logout).setOnClickListener(v -> {
            Api.signOut(this);
            TodayWidgetProvider.refreshAll(this);
            render();
        });
    }

    @Override
    protected void onResume() {
        super.onResume();
        visible = true;
        current = this;
        render();
        if (ACTION_UPDATE.equals(getIntent().getAction())) {
            setIntent(new Intent(this, MainActivity.class));
            installUpdate();
        } else {
            // 앱을 열 때도 새 판을 본다(3시간에 한 번)
            new Thread(() -> {
                Updater.check(getApplicationContext(), false);
                notifyUpdateState();
            }).start();
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        visible = false;
        if (current == this) current = null;
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
    }

    /** 새 판 상태가 바뀌었다(UpdateReceiver · 확인 뒤) - 떠 있는 화면을 고친다 */
    static void notifyUpdateState() {
        MainActivity a = current;
        if (a != null) a.runOnUiThread(() -> {
            a.updating = false;
            a.renderUpdate();
        });
    }

    private void renderUpdate() {
        version.setText("판 " + Updater.currentName(this) + " · 새 판이 나오면 저절로 바뀝니다");
        boolean avail = Updater.available(this);
        updateGroup.setVisibility(avail ? View.VISIBLE : View.GONE);
        if (!avail) return;
        String name = Updater.availableName(this);
        updateText.setText("새 판" + (name.isEmpty() ? "" : " " + name) + "이 나왔습니다. "
                + (Updater.needsConfirm(this) ? "안드로이드가 한 번 확인을 받습니다. '업데이트 설치'를 누른 뒤 확인 창에서 '업데이트'를 눌러 주세요." : "곧 저절로 바뀝니다."));
        update.setEnabled(!updating);
        update.setText(updating ? "받는 중…" : "업데이트 설치");
    }

    /** 사람이 누른 업데이트 - 받아서 깔고, 안드로이드 확인 창이 뜬다(UpdateReceiver) */
    private void installUpdate() {
        if (updating) return;
        updating = true;
        renderUpdate();
        new Thread(() -> {
            Updater.check(getApplicationContext(), true);
            // 확인 창이 뜨거나 실패했으면 UpdateReceiver 가 notifyUpdateState 를 부른다. 바로 끝났으면(새 판 없음) 여기서
            runOnUiThread(() -> {
                if (isFinishing()) return;
                if (!Updater.available(this)) {
                    updating = false;
                    renderUpdate();
                }
            });
        }).start();
    }

    private void render() {
        renderUpdate();
        boolean in = Api.signedIn(this);
        loginGroup.setVisibility(in ? View.GONE : View.VISIBLE);
        statusGroup.setVisibility(in ? View.VISIBLE : View.GONE);
        if (in) {
            who.setText(Api.who(this) + " 님으로 로그인했습니다");
            loadToday();
        }
    }

    private void signIn() {
        String e = email.getText().toString().trim();
        String p = password.getText().toString();
        if (e.isEmpty() || p.isEmpty()) {
            showError("이메일과 비밀번호를 적어 주세요.");
            return;
        }
        login.setEnabled(false);
        login.setText("로그인 중…");
        loginError.setVisibility(View.GONE);
        new Thread(() -> {
            String error = null;
            try {
                Api.signIn(this, e, p);
            } catch (Api.ApiException ex) {
                error = ex.getMessage();
            }
            String err = error;
            runOnUiThread(() -> {
                if (isFinishing()) return;
                login.setEnabled(true);
                login.setText("로그인");
                if (err != null) {
                    showError(err);
                    return;
                }
                password.setText("");
                TodayWidgetProvider.refreshAll(this);
                render();
            });
        }).start();
    }

    private void showError(String text) {
        loginError.setText(text);
        loginError.setVisibility(View.VISIBLE);
    }

    /** 오늘 마감 건수 - 팀 전체와 내 것을 함께 적는다 */
    private void loadToday() {
        today.setText("오늘 마감 작업을 읽는 중…");
        new Thread(() -> {
            String text;
            try {
                List<Api.Task> all = Api.today(this, false);
                int open = 0;
                for (Api.Task t : all) if (!"done".equals(t.status)) open++;
                int mine = Api.today(this, true).size();
                text = "오늘 마감 " + all.size() + "건(남은 일 " + open + "건) · 내 담당 " + mine + "건";
            } catch (Api.ApiException ex) {
                text = ex.getMessage();
            }
            String t = text;
            runOnUiThread(() -> {
                if (isFinishing()) return;
                // 로그인이 풀렸으면 로그인 칸으로 돌아간다
                if (!Api.signedIn(this)) {
                    render();
                    showError(t);
                    return;
                }
                today.setText(t);
            });
        }).start();
    }

    private void openWeb() {
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(Api.WEB + "?view=calendar")));
        } catch (ActivityNotFoundException e) {
            today.setText("주소를 열 브라우저가 없습니다");
        }
    }
}

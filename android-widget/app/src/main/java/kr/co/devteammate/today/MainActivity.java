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
    private View loginGroup, statusGroup;
    private EditText email, password;
    private Button login;
    private TextView loginError, who, today;

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
        render();
    }

    private void render() {
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

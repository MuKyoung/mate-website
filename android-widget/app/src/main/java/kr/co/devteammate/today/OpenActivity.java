package kr.co.devteammate.today;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.widget.Toast;

/**
 * 위젯 항목을 누르면 채워진 주소(웹 작업 관리의 그 작업)를 브라우저로 넘기고 바로 닫는다. 화면은 없다.
 * 우리 주소만 연다 - 위젯 밖에서 이상한 주소가 들어와도 따르지 않게.
 */
public class OpenActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Uri uri = getIntent().getData();
        if (uri != null && uri.toString().startsWith(Api.WEB)) {
            try {
                startActivity(new Intent(Intent.ACTION_VIEW, uri));
            } catch (ActivityNotFoundException e) {
                Toast.makeText(this, "주소를 열 브라우저가 없습니다", Toast.LENGTH_SHORT).show();
            }
        }
        finish();
    }
}

package com.mycompany.pinterior.util;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

public class CursorUtil {

    // 커서 → ID 변환 (디코딩)
    public static Long decode(String cursor) {
        if (cursor == null || cursor.isBlank()) {
            return null;  // 첫 요청은 cursor가 없음
        }
        try {
            byte[] decoded = Base64.getDecoder().decode(cursor);
            String json = new String(decoded, StandardCharsets.UTF_8);
            // json은 "{\"id\":41}" 형태
            // 간단하게 파싱: id 값만 뽑기
            String idStr = json.replaceAll("[^0-9]", "");
            return Long.parseLong(idStr);
        } catch (Exception e) {
            return null;  // 잘못된 cursor면 무시하고 첫 페이지처럼
        }
    }

    // ID → 커서 변환 (인코딩)
    public static String encode(Long id) {
        if (id == null) {
            return null;
        }
        String json = "{\"id\":" + id + "}";
        return Base64.getEncoder()
                .encodeToString(json.getBytes(StandardCharsets.UTF_8));
    }
}
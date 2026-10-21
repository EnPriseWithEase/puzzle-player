package com.enprisewithease.puzzleplayer;

import android.content.ContentResolver;
import android.content.ContentValues;
import android.net.Uri;
import android.os.Build;
import android.provider.MediaStore;
import android.util.Base64;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.OutputStream;

@CapacitorPlugin(name = "DownloadFile")
public class DownloadFilePlugin extends Plugin {

    @PluginMethod
    public void saveToDownloads(PluginCall call) {
        String filename = call.getString("filename");
        String data = call.getString("data");

        if (filename == null || filename.isEmpty()) {
            call.reject("Filename is required");
            return;
        }

        if (data == null || data.isEmpty()) {
            call.reject("File data is required");
            return;
        }

        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
            call.reject("Android 10 or newer is required");
            return;
        }

        byte[] bytes;

        try {
            bytes = Base64.decode(data, Base64.DEFAULT);
        } catch (IllegalArgumentException e) {
            call.reject("Invalid base64 data", e);
            return;
        }

        ContentResolver resolver = getContext().getContentResolver();

        ContentValues values = new ContentValues();
        values.put(
            MediaStore.Downloads.DISPLAY_NAME,
            filename
        );
        values.put(
            MediaStore.Downloads.MIME_TYPE,
            "application/x-sqlite3"
        );
        values.put(
            MediaStore.Downloads.RELATIVE_PATH,
            "Download/"
        );
        values.put(
            MediaStore.Downloads.IS_PENDING,
            1
        );

        Uri uri = null;

        try {
            uri = resolver.insert(
                MediaStore.Downloads.EXTERNAL_CONTENT_URI,
                values
            );

            if (uri == null) {
                call.reject("Could not create file in Downloads");
                return;
            }

            try (OutputStream outputStream =
                     resolver.openOutputStream(uri)) {

                if (outputStream == null) {
                    throw new Exception("Could not open output stream");
                }

                outputStream.write(bytes);
                outputStream.flush();
            }

            ContentValues completed = new ContentValues();
            completed.put(MediaStore.Downloads.IS_PENDING, 0);

            resolver.update(
                uri,
                completed,
                null,
                null
            );

            JSObject result = new JSObject();
            result.put("uri", uri.toString());
            result.put("filename", filename);

            call.resolve(result);

        } catch (Exception e) {
            if (uri != null) {
                resolver.delete(uri, null, null);
            }

            call.reject(
                "Failed to save file to Downloads",
                e
            );
        }
    }
}

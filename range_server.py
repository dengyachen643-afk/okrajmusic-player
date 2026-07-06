from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import os
import re
import sys
from urllib.parse import unquote


class RangeRequestHandler(SimpleHTTPRequestHandler):
    def send_head(self):
        path = self.translate_path(self.path)
        if os.path.isdir(path):
            return super().send_head()
        if not os.path.exists(path):
            self.send_error(404, "File not found")
            return None

        ctype = self.guess_type(path)
        file_size = os.path.getsize(path)
        range_header = self.headers.get("Range")
        if range_header:
            match = re.match(r"bytes=(\d*)-(\d*)", range_header)
            if match:
                start_text, end_text = match.groups()
                start = int(start_text) if start_text else 0
                end = int(end_text) if end_text else file_size - 1
                end = min(end, file_size - 1)
                if start <= end:
                    f = open(path, "rb")
                    f.seek(start)
                    self.send_response(206)
                    self.send_header("Content-type", ctype)
                    self.send_header("Accept-Ranges", "bytes")
                    self.send_header("Content-Range", f"bytes {start}-{end}/{file_size}")
                    self.send_header("Content-Length", str(end - start + 1))
                    self.end_headers()
                    self.range = (start, end)
                    return f

        f = open(path, "rb")
        self.send_response(200)
        self.send_header("Content-type", ctype)
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Content-Length", str(file_size))
        self.send_header("Last-Modified", self.date_time_string(os.path.getmtime(path)))
        self.end_headers()
        self.range = None
        return f

    def copyfile(self, source, outputfile):
        byte_range = getattr(self, "range", None)
        if not byte_range:
            return super().copyfile(source, outputfile)
        start, end = byte_range
        remaining = end - start + 1
        while remaining > 0:
            chunk = source.read(min(64 * 1024, remaining))
            if not chunk:
                break
            outputfile.write(chunk)
            remaining -= len(chunk)


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
    directory = sys.argv[2] if len(sys.argv) > 2 else "public"
    os.chdir(unquote(directory))
    server = ThreadingHTTPServer(("127.0.0.1", port), RangeRequestHandler)
    print(f"Serving {directory} at http://127.0.0.1:{port}/")
    server.serve_forever()

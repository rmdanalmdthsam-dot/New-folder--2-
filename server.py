#!/usr/bin/env python3
import http.server
import socketserver
import webbrowser
import threading
import os

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class LuxuryHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

def start_server():
    # إنشاء خادم محلي على المنفذ المحدد
    with socketserver.TCPServer(("", PORT), LuxuryHandler) as httpd:
        print(f"|---------------------------------------------------------|")
        print(f"|  Engineer Hossam Ramadan Store — Server Running!        |")
        print(f"|  Active URL: http://localhost:{PORT}                       |")
        print(f"|  Press Ctrl+C inside the terminal to stop the server    |")
        print(f"|---------------------------------------------------------|")
        httpd.serve_forever()

if __name__ == "__main__":
    # تشغيل الخادم في خيط منفصل
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()

    # فتح المتصفح تلقائياً بعد ثانية واحدة للتأكد من تشغيل الخادم
    print("Opening browser — Engineer Hossam Ramadan Store...")
    webbrowser.open(f"http://localhost:{PORT}")

    # إبقاء البرنامج الرئيسي يعمل لخدمة الطلبات
    try:
        server_thread.join()
    except KeyboardInterrupt:
        print("\nStopping Apex Motors Web Server. Thank you!")

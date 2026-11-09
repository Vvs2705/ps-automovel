# Serve a pasta VIDEOS PRONTOS só em 127.0.0.1, com CORS liberado apenas para o YouTube Studio
# (o upload pelo Chrome tem limite de 10 MB por arquivo; assim o Studio busca o arquivo inteiro na própria máquina).
import functools
import http.server
import sys

PASTA, PORTA = sys.argv[1], int(sys.argv[2])
ORIGEM = "https://studio.youtube.com"


class H(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", ORIGEM)
        self.send_header("Access-Control-Allow-Private-Network", "true")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def log_message(self, *a):
        pass


http.server.ThreadingHTTPServer(
    ("127.0.0.1", PORTA), functools.partial(H, directory=PASTA)
).serve_forever()


import jwt

METABASE_SITE_URL = "http://crane-cam:3000"
METABASE_SECRET_KEY = "2395ab3fe3f8c0720057ff8327dbfbddbc7eae49bfb6d3b1bd1e625e65381f86"

payload = {
  "resource": {"question": 7},
  "params": {
    
  }
}
token = jwt.encode(payload, METABASE_SECRET_KEY, algorithm="HS256")

iframeUrl = METABASE_SITE_URL + "/embed/question/" + token.decode("utf8") + "#bordered=true&titled=false"

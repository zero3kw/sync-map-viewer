---
layout: empty
---
<html>

<head>
{% include head-custom-google-analytics.html %}
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>Sync Map Viewer</title>
  <link rel="manifest" href="./manifest.webmanifest">
  <meta name="theme-color" content="#198754">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="SyncMap">
  <link rel="apple-touch-icon" href="./assets/icon.png">
  <link rel="icon" type="image/svg+xml" href="./assets/icon.svg">
  <link rel="icon" type="image/png" href="./assets/icon.png">
  <link href="styles.css" rel="stylesheet">
  <!-- Bootstrap CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet"
    integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
   <!-- Leaflet CSS -->
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
  <!-- QRコード生成ライブラリのCDN -->
  <script src="https://cdn.rawgit.com/davidshimjs/qrcodejs/gh-pages/qrcode.min.js"></script>
</head>

<body>

  <!-- ナビゲーションバー -->
  <nav class="navbar navbar-expand-md navbar-dark fixed-top bg-success">
    <div class="container-fluid">
      <a class="navbar-brand" href="#">Sync Map Viewer</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarCollapse"
        aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarCollapse">
        <ul class="navbar-nav me-auto mb-2 mb-md-0">
          <li class="nav-item">
            <a class="nav-link active" aria-current="page" href="./about.html">About</a>
          </li>
        </ul>
        <!--
        <form class="d-flex">
          <input class="form-control me-2" type="search" placeholder="あいことば" aria-label="Search">
          <button class="btn btn-outline-light" type="submit">👥</button>
        </form>
        -->
      </div>
    </div>
  </nav>

  <main class="container-fluid p-0">
    <!-- QRコードを表示するコンテナ -->
    <div id="qrcode-container">
      <div id="qrcode"></div>
    </div>
    <!-- マップコンテナ -->
    <div id="map"></div>
    <!-- 住所検索フォーム -->
    <div id="search-container" class="container">
      <div class="input-group">
        <input type="text" id="search-input" class="form-control" placeholder="住所を検索">
        <button class="btn-lg  btn-success" type="button" id="search-button">🔍</button>
      </div>
    </div>
  </main>

  <!-- JavaScript ライブラリの読み込み -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js"
    integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM"
    crossorigin="anonymous"></script>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
    integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
  <script src="./script.js"></script>
</body>

</html>

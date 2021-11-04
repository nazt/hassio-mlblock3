server {
    listen 8099 default_server;

    include /etc/nginx/includes/server_params.conf;
    include /etc/nginx/includes/proxy_params.conf;

    #location / {
    #    allow   172.30.32.2;
    #    deny    all;

    #    proxy_pass http://backend{{ .entry }}/;
    #}

    location / {
        allow   172.30.32.2;
        deny    all;

        # add_header Content-Type text/plain;
        # add_header  Content-Type    application/json;
        proxy_http_version 1.1;
        proxy_pass         https://ml.in.th/ml-block/;
        # root /www-data;
        # proxy_cache_use_stale error timeout http_500 http_502 http_503 http_504;
    }


}



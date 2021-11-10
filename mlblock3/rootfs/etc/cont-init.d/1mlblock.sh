#!/usr/bin/with-contenv bashio
# ==============================================================================
# Home Assistant Community Add-on: Node-RED
# Configures Node-RED before running
# ==============================================================================
declare port

echo "this is hello, nodejs"
export BASE_INGRESS

# Set the Ingress URL as Almond base URL for correct handling
BASE_INGRESS=$(bashio::addon.ingress_entry)

echo "${BASE_INGRESS}"

# ingress_entry=$(bashio::addon.ingress_entry)
# sed -i "s#%%ingress_entry%%#${ingress_entry}#g" /etc/nginx/nginx.conf
# cat /etc/nginx/nginx.conf

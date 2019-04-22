echo 'Checking SSL cert...'

if [ -e cert.pem ] && [ -e key.pem ]; then
  echo 'Cert found.'
else
  echo 'Cert not found.'
  echo 'Creating SSL for local development...'

  rm cert.pem key.pem

  openssl genrsa 2048 > key.pem
  openssl req -x509 -days 1000 -new -key key.pem -out cert.pem

  echo 'Cert created.'
fi

echo 'Starting static server...'
http-server --ssl -c-1

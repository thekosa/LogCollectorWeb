# Sprawdź, czy Node.js jest zainstalowany
if ! command -v node &> /dev/null; then
    echo "Node.js nie jest zainstalowany. Zainstaluj Node.js ręcznie przed uruchomieniem tego skryptu."
    exit 1
fi

# Wyświetl wersję zainstalowanego Node.js
echo "Znaleziona wersja Node.js:"
node -v

# Sprawdź, czy npm jest dostępny
if ! command -v npm &> /dev/null; then
    echo "NPM nie jest dostępny. Upewnij się, że podczas instalacji Node.js NPM także został zainstalowany."
    exit 1
fi

# Wyświetl wersję NPM
echo "Znaleziona wersja NPM:"
npm -v

# Instalacja serwera statycznego 'serve'
echo "Instalowanie globalnie serwera 'serve'..."
npm install -g serve

# Sprawdź, czy serve został poprawnie zainstalowany
if command -v serve &> /dev/null; then
    echo "Serwer 'serve' został zainstalowany pomyślnie!"
    echo "Wersja 'serve':"
    serve -v
else
    echo "Instalacja serwera 'serve' nie powiodła się."
    exit 1
fi

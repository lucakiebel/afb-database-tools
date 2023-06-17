# afb-database-tools

## Installieren:

Vorher min. Node 16 installieren.

Code entweder klonen oder runterladen: https://github.com/lucakiebel/afb-database-tools/archive/refs/heads/master.zip

In dem Ordner `npm i` ausführen. 

## Benutzung:

### Nutzer-ID-JSON erstellen:

Beispiel: `node users.js -o users.json -u mongodb://127.0.0.1:27017/afb`

```bash
node users.js -h
Usage: users [options]

Options:
  -o --output <filename>  JSON File to which to write users
  -u --url <mongo>        MongoDB Connection String
  -h, --help              display help for command
```

### Abrechnung erstellen:

Beispiel: `node orders.js -f nutzerdaten.json -u mongodb://127.0.0.1:27017/afb`

Wenn `--output` leer ist, wird die Datei einfach `Abrechnung-YYYY-MM-DD.zip` genannt. 

```bash
node orders.js -h
Usage: orders [options]

Options:
  -f --file <json>    JSON File with UserIDs and Dateranges
  -u --url <mongo>    MongoDB Connection String
  -o --output <file>  ZIP Output filepath (must contain .zip)
  -h, --help          display help for command
```

Bei Fragen an mich wenden. 

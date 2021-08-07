rm -rf *.log
npx kill-port 5001
npx kill-port 8080
npx kill-port 9000
npx kill-port 9099
npx kill-port 4000
npx kill-port 4400
firebase emulators:start
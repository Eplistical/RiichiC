set -e

git checkout gh-pages
npm run build
rm -r dist/.git
git add -A
git commit -m 'deploy'
git push origin gh-pages
git checkout main

cd -

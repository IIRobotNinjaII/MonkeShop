const express = require('express')
const router = express.Router()
const puppeteer = require('puppeteer')

router.get('/',(req,res) =>{
    res.render('index')
})

router.post('/',async(req,res) =>{
    const result = await lol(req.body.name);
    res.send(result)
})

module.exports = router

async function lol(product){
    try{
        const browser = await puppeteer.launch({
            args: ['--no-sandbox']
        })
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });
        await page.goto("https://amazon.in", {
          timeout: 3000000
        });
        await page.type('#twotabsearchtextbox', product);
        await page.click('#nav-search-submit-button');
        await page.waitForNavigation({waitUntil:"networkidle0"})        
        await page.screenshot({path: `search-${product}.png`});

        const products = await page.evaluate(() => {
            const links = Array.from(document.querySelectorAll('.s-result-item'));
            return links.map(link => {
              if (link.querySelector(".a-price-whole")) {
                return {
                  name: link.querySelector(".a-size-medium.a-color-base.a-text-normal").textContent,
                  url: link.querySelector(".a-link-normal.a-text-normal").href,
                  image: link.querySelector(".s-image").src,
                  price: parseFloat(link.querySelector(".a-price-whole").textContent.replace(/[,.]/g, m => (m === ',' ? '.' : ''))),
                };
              }
            }).slice(0, 5);
          });
        await browser.close();
        for(var i=1;i<products.length-1;i++){
            for(var j=1;j<products.length- i - 1;j++){
                if(products[j].price>products[j+1].price){
                    var temp = products[j]
                    products[j]=products[j+1]
                    products[j+1]=temp
                }
            }
        }
        return products[1];
        browser.close();
    }catch (error) {
        browser.close();
        console.log(error)
    }
}
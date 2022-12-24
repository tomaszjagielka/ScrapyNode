<br><h1 align="center">ScrapyNode</h1>
<p align="center">
Fully automatic Backpack.tf & Scrap.tf trading bot written in TypeScript.<br>
</p>
<p align="center">
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/%20-Node.js-forestgreen?logo=nodedotjs&logoColor=white" alt="Node.js"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/%20-TypeScript-%233178C6?logo=typescript&logoColor=white" alt="TypeScript"></a>
  <a href="https://jestjs.io/"><img src="https://img.shields.io/badge/%20-Jest-%23C21325?logo=jest" alt="Jest"></a>
</p><br>

## Installation
1. Clone the repository.
 ```sh
 git clone https://github.com/tomaszjagielka/ScrapyNode.git
 ```
 2. Install NPM packages.
 ```sh
 npm install
 ```
 
 ## Usage
 1. Configure your bot by editing the `template.env` file.
 2. Rename the `template.env` file to `.env`
 3. Compile the project using `tsc`
 4. Run the app using `start.bat`

 ## How it works?
It fetches data from Backpack.tf and Scrapy.tf, compares their buy and sell prices of items and finally trades with their bots if profitable.

1. First it initializes APIs it uses and gets items. Optionally creates Backpack.tf alerts for them.
2. Because of the alerts, it can fetch unread notifications and mark them as read.
3. From alerts, it gets needed data, such as the name of the item or price.
4. Then it calculates profit, that the bot uses to check if it should trade the item by comparing prices between the two websites.
5. It updates key (currency) price and item data every `KEY_UPDATE_INTERVAL` and `ITEMS_UPDATE_INTERVAL` respectively.

## Development tips
* Use `npm run app` to automatically build and run the app.
* Use `tsc -w` to automatically recompile the project after every code change.
* Use `npm run build` to automatically recompile and relaunch the app after every code change.
* Use `npm run test` to run the tests and forcefully exit.

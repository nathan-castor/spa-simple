// load node.js libraries
var	util = require('util');
var	fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var scrape = require('scrape-js')

var Stock = require('../models/Stock.js')

var postAllCount = 0
var getAllCount = 0
var updateAllCount = 0
var incorrectNameList = []

function getCompanyDetails(tickerOrName,callback){
  'use strict';
  var company = {}
  company.symbol = tickerOrName
  // url for analysts information
  var url1 = 'https://www.stocktargetprices.com/company/' + tickerOrName;
  // var url1 = 'https://www.marketbeat.com/stocks/' + tickerOrName;
	console.log('url1***',url1)
  request(url1, function(error, response, html){
    if(!error){
      let $ = cheerio.load(html,{
        normalizeWhitespace: true
      });

      var data = $('tr');
      company.exchange = data.children('td:nth-child(2)').html().replace(/\s+/g,'').split(':')[0];
      company.symbol = data.children('td:nth-child(2)').html().replace(/\s+/g,'').split(':')[1];
      company.analysts = [];

      var count = 1;
      var totalTGT = 0;
      var targetP = 0;
      data.each(function(index, el){
        // console.log($(el).text().replace(/\s+/g," ").split(" ")) // REGEX to replace spaces and return as an array
        var targetArray = $(el).children('td:nth-child(5)').text().replace(/\s+/g,'').split('»');
        if (targetArray.length > 1) {
          targetP = targetArray[1];
        }else {
          targetP = targetArray[0];
        }
        company.analysts.push({
          name: $(el).children('td:nth-child(3)').text(),
          rating: $(el).children('td:nth-child(4)').text(),
          target: targetP,
          date: $(el).children('td:nth-child(6)').text()
        });
        if (targetP) { 
          count++;
          totalTGT = parseFloat(totalTGT) + parseInt(targetP);
          // console.log("totalTGT",totalTGT);
        }
      });
      console.log('aveTGT',totalTGT/count);
      company.aveTGT = totalTGT/count;
      // request the yahoo API for stock price
      var priceUrl = 'http://www.nasdaq.com/symbol/'+company.symbol;
      var urlTreasury = 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20(%22^TNX%22)&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=';

      request(priceUrl, function (error, response, html) {
        if (!error && response.statusCode == 200) {
          let $ = cheerio.load(html,{
            normalizeWhitespace: true
          });

          // let $table = $('.genTable > table');
          // // console.log('TABLE', $table.html());
          let dataTwo = $('tbody > tr');
          console.log('dataTwo',dataTwo.html()); 
          var dataIndex = []
          dataTwo.children('td').each(function(index, el){
            dataIndex.push($(el).text())
            // console.log('*****tr from****',index, $(el).text()) //.replace(/\D/g, '')
          })
          console.log('price:',parseFloat(dataIndex[13].replace(/\$/g, "").trim()))
          company.price = parseFloat(dataIndex[13].replace(/\$/g, "").trim())
          company.beta = parseFloat(dataIndex[33])
          request(urlTreasury, function(error, response, html) {
            if(!error){
              var dataFour = response;
              company.treasuryYield = parseFloat(JSON.parse(dataFour.body).query.results.quote.LastTradePriceOnly);
              callback(company);
            }
          }); // REQ TREASURY
        }
      }); // PRICE IF NO ERROR
    }
  });
}

module.exports = {

	// show one stock from scraped sites and yahoo finance API
	showCompany: function(req,res){
    var ticker = 'Apple Inc.'
    //console.log("company",company)
    getCompanyDetails(ticker, function(company){
      //console.log("company",company)
      var newCompany = {
        companyName: company.name,
        symbol: company.symbol,
        price: company.price,
        beta: company.beta,
        treasuryYield: company.treasuryYield,
        StockExchange: company.StockExchange,
        analysts: company.analysts
      }
      // console.log("newCompany::",newCompany.symbol, newCompany.beta, newCompany.price)
      res.json({newCompany:newCompany})
    })
  },
  postCompany: function(req,res){
    getCompanyDetails(req,res, function(company){
      var newCompany = {
      	companyName: company.name,
      	symbol: company.symbol,
      	analysts: company.analysts,
        price: company.price,
        beta: company.beta,
        treasuryYield: company.treasuryYield,
        aveTGT: company.aveTGT
      }

      Stock.create(newCompany, function(err, stock){
  			if(err) return console.log(err)
        //POST THE STOCK
  			res.json({success: true, message: "Stock added!", stock: stock})
      })
    })
  },
  getAll: function(req,res, callback) { 
  	console.log('Started getAll');
    var coName = newCoList[getAllCount]
    //console.log("company",company)
    getCompanyDetails(coName, function(company){
      //console.log("company",company)
      var newCompany = {
        companyName: coName,
        incorrectName: company.incorrectName,
        symbol: company.symbol,
        price: company.price,
        beta: company.beta,
        treasuryYield: company.treasuryYield // ,
        // analysts: company.analysts
      }
      console.log("newCompany",newCompany)
      if (getAllCount < newCoList.length) {
        getAllCount++
      }else{
        getAllCount = 0
        return
      }
      console.log("getAllCount",getAllCount)
      // Call back this function to continue updating each stock
      setTimeout(function() {
        request("http://localhost:3000/user/scrape/stocks", function(error, response, html) {
        if(!error){
          //var rqstResponse = response
          console.log("response.body", response.body)
        }
      })
      },(1000))

    })

    res.send("check yo console")
  },
  postAll: function(req,res){
    var coName = coTickers[postAllCount]
    //console.log("company",company)
    getCompanyDetails(coName, function(company){
      //console.log("company",company)
      var newCompany = {
        companyName: company.name,
        symbol: company.symbol,
        price: company.price,
        beta: company.beta,
        treasuryYield: company.treasuryYield,
        analysts: company.analysts
      }
      console.log("newCompany",newCompany)
      if (postAllCount < coTickers.length) {
        postAllCount++
        console.log("postAllCount:",postAllCount)
      }else{
        postAllCount = 0
        return console.log("done posting stocks")
      }
      Stock.create(newCompany, function(err, stock){
        if(err) return console.log(err)
        //POST THE STOCK
        setTimeout(function() {
          request.post("http://localhost:3000/api/scrape/stocks", function(error, response, html) {
            if(!error){
              //var rqstResponse = response
              console.log("response.body", response.body)
            }
          })
        },(1000))
      })
    })

    res.send("check yo console")
  },
  updateAll: function(req,res){
    var ticker = coTickers[updateAllCount]
    //console.log("company",company)
    getCompanyDetails(ticker, function(company){
      //console.log("company",company)
      var updatedCompany = {
        companyName: company.name,
        symbol: company.symbol,
        price: company.price,
        beta: company.beta,
        treasuryYield: company.treasuryYield,
        analysts: company.analysts
      }
      console.log("updatedCompany",updatedCompany)
      if (updateAllCount < coTickers.length) { //
        updateAllCount++
        console.log("updateAllCount:",updateAllCount)
      }else{
        updateAllCount = 0
        return console.log("done updating stocks")
      }
      Stock.findOneAndUpdate({symbol: ticker}, updatedCompany, {new: true}, function(err, stock){
        if(err) return console.log(err)
        //POST THE STOCK
        setTimeout(function() {
          request.patch("http://localhost:3000/api/scrape/stocks", function(error, response, html) {
            if(!error){
              //var rqstResponse = response
              console.log("response.body", response.body)
            }
          })
        },(1000))
      })
    })

    res.send("check yo console")
  },
  indexCompanies: function(req,res) {
    Stock.find({}, function(err, stocks){
      if(err) return console.log(err)
      // if(err) console.log("indexCompanies error", err)
			res.json(stocks)
		})
  },
  showStock: function(req,res){
    console.log(req.params)
		Stock.findOne({_id: req.params.id}, function(err, stock){
			if(err) return console.log(err)
			res.json(stock)
		})
	},
  updateCompany: function(req,res){
    getCompanyDetails(req,res, function(company){
      var updatedCompany = {
      	companyName: company.name,
      	symbol: company.symbol,
      	analysts: company.analysts,
        price: company.price,
        beta: company.beta,
        treasuryYield: company.treasuryYield,
        aveTGT: company.aveTGT
      }
  		Stock.findOneAndUpdate({_id: req.params.id}, updatedCompany, {new: true}, function(err, stock){
  			if(err) return console.log(err)
  			res.json({success: true, message: "Stock updated!", stock: stock})
  		})
    })
	},
  deleteStock: function(req,res){
		Stock.findOneAndRemove({_id: req.params.id}, function(err){
			if(err) return console.log(err)
			res.json({success: true, message: "Stock Deleted!"})
		})
	},
  indexAnalysts: function(req,res){
  	url = 'https://www.stocktargetprices.com/latest';
  	request(url, function(error, response, html){
  	  if(!error){
  	    var $ = cheerio.load(html);
  	    var companyName, companySymble, analyst, targetPrice;
  	    var json = { company : companyName, analyst : analyst, target: targetPrice};
  	    $('.company-name').filter(function(){
  	        var data = $(this);
  	        companyName = data.text();
  	        json.companyName = companyName;
  	    })
  		}
			res.json(json)
  	})
  }
}

var alreadyInDB = ['FB','GOOG','GOOGL','YHOO']

var didntWork = ['BXLT','ACE','ALLE','CMCSK','CPGX','HPQ','MHK','PCL','PCP','POM','PYPL','STZ','SYF']

var coTickers = ['FB','GOOG','GOOGL','YHOO','A','AA','AAL','AAP','AAPL','ABBV','ABC','ABT','ACN','ADBE','ADI','ADM','ADP','ADS','ADSK','ADT','AEE','AEP','AES','AET','AFL','AGN','AIG','AIV','AIZ','AKAM','ALL','ALTR','ALXN','AMAT','AME','AMG','AMGN','AMP','AMT','AMZN','AN','ANTM','AON','APA','APC','APD','APH','ARG','ATVI','AVB','AVGO','AVY','AXP','AZO','BA','BAC','BAX','BBBY','BBT','BBY','BCR','BDX','BEN','BF-B','BHI','BIIB','BK','BLK','BLL','BMY','BRCM','BRK-B','BSX','BWA','BXLT','C','CA','CAG','CAH','CAM','CAT','CB','CBG','CBS','CCE','CCI','CCL','CELG','CERN','CF','CHK','CHRW','CI','CINF','CL','CLX','CMA','CMCSA','CME','CMG','CMI','CMS','CNP','CNX','COF','COG','COH','COL','COP','COST','CPB','CRM','CSC','CSCO','CSX','CTAS','CTL','CTSH','CTXS','CVC','CVS','CVX','D','DAL','DD','DE','DFS','DG','DGX','DHI','DHR','DIS','DISCA','DISCK','DLPH','DLTR','DNB','DO','DOV','DOW','DPS','DRI','DTE','DUK','DVA','DVN','EA','EBAY','ECL','ED','EFX','EIX','EL','EMC','EMN','EMR','ENDP','EOG','EQIX','EQR','EQT','ES','ESRX','ESS','ESV','ETFC','ETN','ETR','EW','EXC','EXPD','EXPE','F','FAST','FCX','FDX','FE','FFIV','FIS','FISV','FITB','FLIR','FLR','FLS','FMC','FOSL','FOX','FOXA','FSLR','FTI','FTR','GAS','GD','GE','GGP','GILD','GIS','GLW','GM','GMCR','GME','GPC','GPS','GRMN','GS','GT','GWW','HAL','HAR','HAS','HBAN','HBI','HCA','HCN','HCP','HD','HES','HIG','HOG','HON','HOT','HP','HPE','HRB','HRL','HRS','HSIC','HST','HSY','HUM','IBM','ICE','IFF','ILMN','INTC','INTU','IP','IPG','IR','IRM','ISRG','ITW','IVZ','JBHT','JCI','JEC','JNJ','JNPR','JPM','JWN','K','KEY','KHC','KIM','KLAC','KMB','KMI','KMX','KO','KORS','KR','KSS','KSU','L','LB','LEG','LEN','LH','LLL','LLTC','LLY','LM','LMT','LNC','LOW','LRCX','LUK','LUV','LVLT','LYB','M','MA','MAC','MAR','MAS','MAT','MCD','MCHP','MCK','MCO','MDLZ','MDT','MET','MHFI','MJN','MKC','MLM','MMC','MMM','MNK','MNST','MO','MON','MOS','MPC','MRK','MRO','MS','MSFT','MSI','MTB','MU','MUR','MYL','NAVI','NBL','NDAQ','NEE','NEM','NFLX','NFX','NI','NKE','NLSN','NOC','NOV','NRG','NSC','NTAP','NTRS','NUE','NVDA','NWL','NWS','NWSA','O','OI','OKE','OMC','ORCL','ORLY','OXY','PAYX','PBCT','PBI','PCAR','PCG','PCLN','PDCO','PEG','PEP','PFE','PFG','PG','PGR','PH','PHM','PKI','PLD','PM','PNC','PNR','PNW','PPG','PPL','PRGO','PRU','PSA','PSX','PVH','PWR','PX','PXD','QCOM','QRVO','R','RAI','RCL','REGN','RF','RHI','RHT','RIG','RL','ROK','ROP','ROST','RRC','RSG','RTN','SBUX','SCG','SCHW','SE','SEE','SHW','SIG','SJM','SLB','SLG','SNA','SNDK','SNI','SO','SPG','SPLS','SRCL','SRE','STI','STJ','STT','STX','SWK','SWKS','SWN','SYK','SYMC','SYY','T','TAP','TDC','TE','TEL','TGNA','TGT','THC','TIF','TJX','TMK','TMO','TRIP','TROW','TRV','TSCO','TSN','TSO','TSS','TWC','TWX','TXN','TXT','TYC','UA','UAL','UHS','UNH','UNM','UNP','UPS','URBN','URI','USB','UTX','V','VAR','VFC','VIAB','VLO','VMC','VNO','VRSK','VRSN','VRTX','VTR','VZ','WAT','WBA','WDC','WEC','WFC','WFM','WHR','WM','WMB','WMT','WRK','WU','WY','WYN','WYNN','XEC','XEL','XL','XLNX','XOM','XRAY','XRX','XYL','YUM','ZBH','ZION','ZTS']

var newCoList = ['Alcoa Inc','American Airlines Group','Apple Inc.']

var companiesList = [ 'Agilent Technologies Inc.','Alcoa Inc.','American Airlines Group','Advance Auto Parts, Inc.','Apple Inc.','Abbvie','AmerisourceBergen Corp','Abbott Laboratories','ACE Limited','Accenture plc','Adobe Systems Inc.','Analog Devices, Inc.','Archer-Daniels-Midland Co','Automatic Data Processing','Alliance Data Systems','Autodesk Inc.','ADT Corp','Ameren Corp','American Electric Power','AES Corp','Aetna Inc.','AFLAC Inc.','Allergan plc','American International Group',' Inc.','Apartment Investment & Mgmt','Assurant Inc.','Akamai Technologies Inc.','Allstate Corp','Allegion','Altera Corp','Alexion Pharmaceuticals','Applied Materials Inc.','Ametek','Affiliated Managers Group Inc.','Amgen Inc.','Ameriprise Financial','American Tower Corp A','Amazon.com Inc.','AutoNation Inc.','Anthem Inc.','Aon plc','Apache Corporation','Anadarko Petroleum Corp','Air Products & Chemicals Inc.','Amphenol Corp A','Airgas Inc.','Activision Blizzard','AvalonBay Communities',' Inc.','Avago Technologies','Avery Dennison Corp','American Express Co','AutoZone Inc.','Boeing Company','Bank of America Corp','Baxter International Inc.','Bed Bath & Beyond','BB&T Corporation','Best Buy Co. Inc.','Bard (C.R.) Inc.','Becton Dickinson','Franklin Resources','Brown-Forman Corporation','Baker Hughes Inc.','BIOGEN IDEC Inc.','The Bank of New York Mellon Corp.','BlackRock','Ball Corp','Bristol-Myers Squibb','Broadcom Corporation','Berkshire Hathaway','Boston Scientific','BorgWarner','Baxalta','Boston Properties','Citigroup Inc.','CA',' Inc.','ConAgra Foods Inc.','Cardinal Health Inc.','Cameron International Corp.','Caterpillar Inc.','Chubb Corp.','CBRE Group','CBS Corp.','Coca-Cola Enterprises','Crown Castle International Corp.','Carnival Corp.','Celgene Corp.','Cerner','CF Industries Holdings Inc.','Chesapeake Energy','C. H. Robinson Worldwide','CIGNA Corp.','Cincinnati Financial','Colgate-Palmolive','The Clorox Company','Comerica Inc.','Comcast A Corp','Comcast Special Corp Class A','CME Group Inc.','Chipotle Mexican Grill','Cummins Inc.','CMS Energy','CenterPoint Energy','CONSOL Energy Inc.','Capital One Financial','Cabot Oil & Gas','Coach Inc.','Rockwell Collins','ConocoPhillips','Costco Co.','Campbell Soup','Columbia Pipeline Group Inc.','Salesforce.com','Computer Sciences Corp.','Cisco Systems','CSX Corp.','Cintas Corporation','CenturyLink Inc.','Cognizant Technology Solutions','Citrix Systems','Cablevision Systems Corp.','CVS Caremark Corp.','Chevron Corp.','Dominion Resources','Delta Air Lines','Du Pont (E.I.)','Deere & Co.','Discover Financial Services','Dollar General','Quest Diagnostics','D. R. Horton','Danaher Corp.','The Walt Disney Company','Discovery Communications-A','Discovery Communications-C','Delphi Automotive','Dollar Tree','Dun & Bradstreet','Diamond Offshore Drilling','Dover Corp.','Dow Chemical','Dr Pepper Snapple Group','Darden Restaurants','DTE Energy Co.','Duke Energy','DaVita Inc.','Devon Energy Corp.','Electronic Arts','eBay Inc.','Ecolab Inc.','Consolidated Edison','Equifax Inc.','Edison Int\'l','Estee Lauder Cos.','EMC Corp.','Eastman Chemical','Emerson Electric Company','Endo International','EOG Resources','Equinix','Equity Residential','EQT Corporation','Eversource Energy','Express Scripts','Essex Property Trust Inc.','Ensco plc','E*Trade','Eaton Corporation','Entergy Corp.','Edwards Lifesciences','Exelon Corp.','Expeditors Int\'l','Expedia Inc.','Ford Motor','Fastenal Co','Facebook','Freeport-McMoran Cp & Gld','FedEx Corporation','FirstEnergy Corp','F5 Networks','Fidelity National Information Services','Fiserv Inc.','Fifth Third Bancorp','FLIR Systems','Fluor Corp.','Flowserve Corporation','FMC Corporation','Fossil',' Inc.','Twenty-First Century Fox Class B','Twenty-First Century Fox Class A','First Solar Inc.','FMC Technologies Inc.','Frontier Communications','AGL Resources Inc.','General Dynamics','General Electric','General Growth Properties Inc.','Gilead Sciences','General Mills','Corning Inc.','General Motors','Keurig Green Mountain','GameStop Corp.','Alphabet Inc Class C','Alphabet Inc Class A','Genuine Parts','Gap (The)','Garmin Ltd.','Goldman Sachs Group','Goodyear Tire & Rubber','Grainger (W.W.) Inc.','Halliburton Co.','Harman Int\'l Industries','Hasbro Inc.','Huntington Bancshares','Hanesbrands Inc.','HCA Holdings','Welltower Inc.','HCP Inc.','Home Depot','Hess Corporation','Hartford Financial Svc.Gp.','Harley-Davidson','Honeywell Int\'l Inc.','Starwood Hotels & Resorts','Helmerich & Payne','Hewlett Packard Enterprise','HP Inc.','Block H&R','Hormel Foods Corp.','Harris Corporation','Henry Schein','Host Hotels & Resorts','The Hershey Company','Humana Inc.','International Bus. Machines','Intercontinental Exchange','Intl Flavors & Fragrances','Illumina Inc.','Intel Corp.','Intuit Inc.','International Paper','Interpublic Group','Ingersoll-Rand PLC','Iron Mountain Incorporated','Intuitive Surgical Inc.','Illinois Tool Works','Invesco Ltd.','J. B. Hunt Transport Services','Johnson Controls','Jacobs Engineering Group','Johnson & Johnson','Juniper Networks','JPMorgan Chase & Co.','Nordstrom','Kellogg Co.','KeyCorp','Kraft Heinz Co','Kimco Realty','KLA-Tencor Corp.','Kimberly-Clark','Kinder Morgan','Carmax Inc.','The Coca Cola Company','Michael Kors Holdings','Kroger Co.','Kohl\'s Corp.','Kansas City Southern','Loews Corp.','L Brands Inc.','Leggett & Platt','Lennar Corp.','Laboratory Corp. of America Holding','L-3 Communications Holdings','Linear Technology Corp.','Lilly (Eli) & Co.','Legg Mason','Lockheed Martin Corp.','Lincoln National','Lowe\'s Cos.','Lam Research','Leucadia National Corp.','Southwest Airlines','Level 3 Communications','LyondellBasell','Macy\'s Inc.','Mastercard Inc.','Macerich','Marriott Int\'l.','Masco Corp.','Mattel Inc.','McDonald\'s Corp.','Microchip Technology','McKesson Corp.','Moody\'s Corp','Mondelez International','Medtronic plc','MetLife Inc.','McGraw Hill Financial','Mohawk Industries','Mead Johnson','McCormick & Co.','Martin Marietta Materials','Marsh & McLennan','3M Company','Mallinckrodt Plc','Monster Beverage','Altria Group Inc.','Monsanto Co.','The Mosaic Company','Marathon Petroleum','Merck & Co.','Marathon Oil Corp.','Morgan Stanley','Microsoft Corp.','Motorola Solutions Inc.','M&T Bank Corp.','Micron Technology','Murphy Oil','Mylan N.V.','Navient','Noble Energy Inc.','NASDAQ OMX Group','NextEra Energy','Newmont Mining Corp. (Hldg. Co.)','Netflix Inc.','Newfield Exploration Co','NiSource Inc.','Nike','Nielsen Holdings','Northrop Grumman Corp.','National Oilwell Varco Inc.','NRG Energy','Norfolk Southern Corp.','NetApp','Northern Trust Corp.','Nucor Corp.','Nvidia Corporation','Newell Rubbermaid Co.','News Corp. Class B','News Corp. Class A','Realty Income Corporation','Owens-Illinois Inc.','ONEOK','Omnicom Group','Oracle Corp.','O\'Reilly Automotive','Occidental Petroleum','Paychex Inc.','People\'s United Financial','Pitney-Bowes','PACCAR Inc.','PG&E Corp.','Plum Creek Timber Co.','Priceline.com Inc.','Precision Castparts','Patterson Companies','Public Serv. Enterprise Inc.','PepsiCo Inc.','Pfizer Inc.','Principal Financial Group','Procter & Gamble','Progressive Corp.','Parker-Hannifin','Pulte Homes Inc.','PerkinElmer','Prologis','Philip Morris International','PNC Financial Services','Pentair Ltd.','Pinnacle West Capital','Pepco Holdings Inc.','PPG Industries','PPL Corp.','Perrigo','Prudential Financial','Public Storage','Phillips 66','PVH Corp.','Quanta Services Inc.','Praxair Inc.','Pioneer Natural Resources','PayPal','QUALCOMM Inc.','Qorvo','Ryder System','Reynolds American Inc.','Royal Caribbean Cruises Ltd','Regeneron','Regions Financial Corp.','Robert Half International','Red Hat Inc.','Transocean','Polo Ralph Lauren Corp.','Rockwell Automation Inc.','Roper Industries','Ross Stores','Range Resources Corp.','Republic Services Inc.','Raytheon Co.','Starbucks Corp.','SCANA Corp','Charles Schwab Corporation','Spectra Energy Corp.','Sealed Air Corp.(New)','Sherwin-Williams','Signet Jewelers','Smucker (J.M.)','Schlumberger Ltd.','SL Green Realty','Snap-On Inc.','SanDisk Corporation','Scripps Networks Interactive Inc.','Southern Co.','Simon Property Group Inc.','Staples Inc.','Stericycle Inc.','Sempra Energy','SunTrust Banks','St Jude Medical','State Street Corp.','Seagate Technology','Constellation Brands','Stanley Black & Decker','Skyworks Solutions','Southwestern Energy','Synchrony Financial','Stryker Corp.','Symantec Corp.','Sysco Corp.','AT&T Inc.','Molson Coors Brewing Company','Teradata Corp.','TECO Energy','TE Connectivity Ltd.','Tegna','Target Corp.','Tenet Healthcare Corp.','Tiffany & Co.','TJX Companies Inc.','Torchmark Corp.','Thermo Fisher Scientific','TripAdvisor','T. Rowe Price Group','The Travelers Companies Inc.','Tractor Supply Company','Tyson Foods','Tesoro Petroleum Co.','Total System Services','Time Warner Cable Inc.','Time Warner Inc.','Texas Instruments','Textron Inc.','Tyco International','Under Armour','United Continental Holdings','Universal Health Services',' Inc.','United Health Group Inc.','Unum Group','Union Pacific','United Parcel Service','Urban Outfitters','United Rentals',' Inc.','U.S. Bancorp','United Technologies','Visa Inc.','Varian Medical Systems','V.F. Corp.','Viacom Inc.','Valero Energy','Vulcan Materials','Vornado Realty Trust','Verisk Analytics','Verisign Inc.','Vertex Pharmaceuticals Inc.','Ventas Inc.','Verizon Communications','Waters Corporation','Walgreens Boots Alliance','Western Digital','Wisconsin Energy Corporation','Wells Fargo','Whole Foods Market','Whirlpool Corp.','Waste Management Inc.','Williams Cos.','Wal-Mart Stores','Westrock Co','Western Union Co','Weyerhaeuser Corp.','Wyndham Worldwide','Wynn Resorts Ltd','Cimarex Energy','Xcel Energy Inc.','XL Capital','Xilinx Inc.','Exxon Mobil Corp.','Dentsply International','Xerox Corp.','Xylem Inc.','Yahoo Inc.','Yum! Brands Inc.','Zimmer Biomet Holdings','Zions Bancorp','Zoetis' ]

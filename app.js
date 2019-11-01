const express = require('express')
const cors = require('cors')
const app = express()

const winrm = require('nodejs-winrm')
const sql = require('mssql')

app.use(cors())
app.use(express.json())
require ('dotenv').config()

const PORT = process.env.PORT || 5000
const WINRM_PORT = process.env.WINRM_PORT || 5985

app.listen(PORT, () => {
    console.log(`Backend Service is now listening on port: ${PORT}`)
})



/**
 * Get status on home route
 */
app.get('/', (req,res) => {
    res.send('Hello, API is Online')
})


/**
 * Returns all available carparks
 * their devices
 * and pricing plans
 * associated with it
 */
app.get('/carparks', (req,res) => {
    res.status(200).json(carparks);
})


/**
 * Get purchase request from frontend
 */
app.post('/requestpurchase', (req,res) => {
    purchaseRequests.push(req.body)
    console.log(purchaseRequests)
    res.status(200).json({
        message: "OK"
    })
})



/**
 * Return all purchase requests
 */
app.get('/purchase', (req,res) => {
    res.status(200).json(purchaseRequests)
})

/**
 * Purchases with status 0 = NEW
 */
app.get('/purchase/new', (req,res) => {
    let data = purchaseRequests.filter(purchaseReq => {
        return purchaseReq.status === 0
    })
    res.status(200).json(data);
})

/**
 * Purchases with status 1 = APPROVED
 */
app.get('/purchase/approved', (req,res) => {
    let data = purchaseRequests.filter(purchaseReq => {
        return purchaseReq.status === 1
    })
    res.status(200).json(data);
})

/**
 * Purchases with status 2 = DECLINED
 */
app.get('/purchase/declined', (req,res) => {
    let data = purchaseRequests.filter(purchaseReq => {
        return purchaseReq.status === 2
    })
    res.status(200).json(data);
})

/**
 * Purchases with status 3 = LIVE
 */
app.get('/purchase/live', (req,res) => {
    let data = purchaseRequests.filter(purchaseReq => {
        return purchaseReq.status === 3
    })
    res.status(200).json(data);
})



/**
 * Set status from Mobile App
 * @param status
 */

 app.post('/purchase/status/:id', async (req, res) => {
    let newstatus = req.body.status;
    console.log(newstatus)
    let pid = req.params.id;
    console.log(pid)
    let index = purchaseRequests.findIndex(purchaseReq => {
        return purchaseReq.id === pid;
    })
    //set the value
    if (newstatus === 1) {
        //approved
        purchaseRequests[index].status = 3;
        let url = purchaseRequests[index].url;
        console.log('ovdje pise url' + url)
        //push to db
        try {
            await sql.connect(process.env.MSSQL)
            const rows = await sql.query`select LfdNr from KAWERBUNG WHERE KaTyp = 7`
            let lfdnr = rows.recordset.length + 1;
            await sql.query`insert INTO KAWERBUNG VALUES (7,${lfdnr},'',20,0,2,${url})`
            sql.close();
            res.sendStatus(200)
        } catch (err) {
            console.log(err);
            res.sendStatus(500);
        }
    } else {
        purchaseRequests[index].status = newstatus;
        console.log(purchaseRequests)
        res.sendStatus(200);
    }
 })


/**
 * Connects to APM, kills payment machine to perform sync with DB
 */

app.get('/sync', (req, res) => {
    try {
        winrm.runCommand('taskkill /IM "PaymentMachine.exe" /F', '0001404-10', process.env.WINRM_USER, process.env.WINRM_PASS, WINRM_PORT);
        res.sendStatus(200)
    } catch (err) {
        res.send(err)
    }
})




app.get('/testdb', (req,res) => {
    let data = addAdToDB(process.env.MSSQL)
    res.status(200).send()
})

app.get('/countadverts',async (req,res) => {
    try {
        await sql.connect(process.env.MSSQL)
        const result = await sql.query`select LfdNr from KAWERBUNG WHERE KaTyp = 7`
        console.dir(result)
        res.json({
         count: result.recordset.length
        })
    } catch (err) {
        console.log(err);
    }
})

 



/**
 * Store purchases in memory
 */
const purchaseRequests = [];


/**
 * Carparks in memory 
 */

const carparks = [{
    position: {lat: 47.7894, lng: 13.0006},
    content: '<h3>Airport Visitor Parking</h3><p>Short-Term parking directly @Norweg airport.</p><a href="#deviceinfo" class="btn">Advertise Here</a>',
    description: 'Short-Term parking with low rates specially designed for Norweg airport visitors.',
    name: "Airport Visitor Parking",
    devices: [
        {
            deviceNo: 10,
            deviceName: "AP10",
            deviceType: "skiosk.Slim"
        },
    ],
    pricingplans: [
        {
            name: "1-Week Premium",
            period: "1 week",
            price: "179,99 EUR",
            description: "Get our 1-Week premium package which is the best-buy for small advertisers. Start promoting your product or business today. With premium package you are provided with more sophisticated options and perks such as 24/7 support and continues content management.",
            features: [
                "Approval within 24 hours.",
                "Extend your plan duration and get 30% off!",
                "Update your advertisment content anytime!",
                "24/7 support."
            ]
        },
        {
            name: "1-Month Professional",
            period: "1 month",
            price: "300,99 EUR",
            description: "Taking your business/product seriously and expecting the big results? Professional plan is the one you are looking for. Enjoy the full service with all perks unlocked. Check all available bonus features <a href='#'>here</a>.",
            features: [
                "Approval within 12 hours.",
                "Become our partner and unlock the special discounts/offers and other benefits!",
                "Update your advertisment content anytime!",
                "24/7 support and much more!"
            ]
        }
    ]
},
{
    position: {lat: 47.7869, lng: 12.9871},
    content: '<h3>Airort long-term parking</h3><p>Long-Term parking directly @Norweg Airport</p><a href="#deviceinfo" class="btn">Advertise Here</a>',
    description: 'Park your car directly @airpot in highly secured garage and continue your trip/departure safely',
    name: "Airort long-term parking",
    devices: [
        {
            deviceNo: 10,
            deviceName: "AP10",
            deviceType: "skiosk.Slim"
        },
        {
            deviceNo: 11,
            deviceName: "AP11",
            deviceType: "skiosk.Lite"
        },
        {
            deviceNo: 12,
            deviceName: "AP12",
            deviceType: "skiosk.Smart"
        },
        {
            deviceNo: 13,
            deviceName: "AP13",
            deviceType: "skiosk.Smart"
        },
        {
            deviceNo: 14,
            deviceName: "AP14",
            deviceType: "skiosk.Smart"
        }
    ],
    pricingplans: [
        {
          name: "1-Day Basic",
          period: "1 day",
          price: "29,99 EUR",
          description: "Get our 1-day basic offer to try out our service for 24 hours. With this low pricing plan, you can reserve your advertisment space today and get familiar with perks of our advertisment service. Welcome to entry level of our proffesianal parking advertisment!",
          features: [
              "Approval within 48 hours.",
              "Extend your plan duration and get 20% off!"
            ]
        },
        {
          name: "1-Week Premium",
          period: "1 week",
          price: "179,99 EUR",
          description: "Get our 1-Week premium package which is the best-buy for small advertisers. Start promoting your product or business today. With premium package you are provided with more sophisticated options and perks such as 24/7 support and continues content management.",
          features: [
              "Approval within 24 hours.",
              "Extend your plan duration and get 30% off!",
              "Update your advertisment content anytime!",
              "24/7 support."
            ]
        },
        {
          name: "1-Month Professional",
          period: "1 month",
          price: "300,99 EUR",
          description: "Taking your business/product seriously and expecting the big results? Professional plan is the one you are looking for. Enjoy the full service with all perks unlocked. Check all available bonus features <a href='#'>here</a>.",
          features: [
              "Approval within 12 hours.",
              "Become our partner and unlock the special discounts/offers and other benefits!",
              "Update your advertisment content anytime!",
              "24/7 support and much more!"
            ]
        }
    ]
},
{
    position: {lat: 47.8167, lng: 13.0562},
    content: '<h3>Norweg City Parking</h3><p>Long-Term and Short-Term parking in city center itself!</p><a href="#deviceinfo" class="btn">Advertise Here</a>',
    description: 'Welcome to Salzburg! Park your vehicle directly in city center with one of the cheapest car park rates available in area. Use opportunity after shopping to validte your parking ticket and obtain discounts!',
    name: "Norweg City Parking",
    devices: [
        {
            deviceNo: 10,
            deviceName: "AP10",
            deviceType: "skiosk.Slim"
        },
        {
            deviceNo: 11,
            deviceName: "AP11",
            deviceType: "skiosk.Lite"
        },
        {
            deviceNo: 12,
            deviceName: "AP12",
            deviceType: "skiosk.Smart"
        }
    ],
    pricingplans: [
        {
          name: "1-Day Basic",
          period: "1 day",
          price: "29,99 EUR",
          description: "Get our 1-day basic offer to try out our service for 24 hours. With this low pricing plan, you can reserve your advertisment space today and get familiar with perks of our advertisment service. Welcome to entry level of our proffesianal parking advertisment!",
          features: [
              "Approval within 48 hours.",
              "Extend your plan duration and get 20% off!"
            ]
        },
        {
          name: "1-Week Premium",
          period: "1 week",
          price: "179,99 EUR",
          description: "Get our 1-Week premium package which is the best-buy for small advertisers. Start promoting your product or business today. With premium package you are provided with more sophisticated options and perks such as 24/7 support and continues content management.",
          features: [
              "Approval within 24 hours.",
              "Extend your plan duration and get 30% off!",
              "Update your advertisment content anytime!",
              "24/7 support."
            ]
        },
        {
          name: "1-Month Professional",
          period: "1 month",
          price: "300,99 EUR",
          description: "Taking your business/product seriously and expecting the big results? Professional plan is the one you are looking for. Enjoy the full service with all perks unlocked. Check all available bonus features <a href='#'>here</a>.",
          features: [
              "Approval within 12 hours.",
              "Become our partner and unlock the special discounts/offers and other benefits!",
              "Update your advertisment content anytime!",
              "24/7 support and much more!"
            ]
        }
    ]
}]


/**
 * test db connection and query
 */
async function addAdToDB(conn) {
    try {
        await sql.connect(conn)
        const result = await sql.query`insert into KAWERBUNG values (7,2,'',20,0,2,'https://www.google.com')`
        console.dir(result)
        return result;
    } catch (err) {
        console.log(err);
    }
}

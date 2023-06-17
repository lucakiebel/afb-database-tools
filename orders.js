const mongoose = require("mongoose");
const fsp = require("fs/promises");
const fs = require("fs");
const { program } = require("commander");
const AdmZip = require("adm-zip");

program
	.requiredOption("-f --file <json>", "JSON File with UserIDs and Dateranges")
    .requiredOption("-u --url <mongo>", "MongoDB Connection String")
    .option("-o --output <file>", "ZIP Output filepath (must contain .zip)");

program.parse()

const args = program.opts();

(async () => {
    await mongoose.connect(args.url);
    const Account = mongoose.model("Account", new mongoose.Schema({}, { strict: false }));
    const Order = mongoose.model("Order", new mongoose.Schema({}, { strict: false }));
    const Product = mongoose.model("Product", new mongoose.Schema({}, { strict: false }));

    const userDates = JSON.parse(await fsp.readFile(args.file));

    const usersWithOrders = await Promise.all(userDates.map(async user => {
        const id = user.id;
        const dateStart = new Date(user.dateStart);

        const account = await Account.findOne({ _id: id });

        const orders = await Order.find({ account: id, date: { $gt: dateStart }, bund:{$in:["", null]} });

        return {
            user: account,
            orders
        };
    }));

    const products = await Product.find();

    const ordersSortedByProduct = await Promise.all(usersWithOrders.map(async uo => {
        const { user, orders } = uo;

        const items = orders.map(order => order.items).flat();

        const final = items.reduce((acc, item) => {
            if (acc[item.product]) {
                acc[item.product].amount += item.amount;
            } else {
                acc[item.product] = {
                    amount: item.amount,
                }
            }

            return acc;
        }, {});

        return {
            user,
            productAmount: final,
        };
    }));


    const csvs = ordersSortedByProduct.map(uo => {
        const { user, productAmount } = uo;

        let csv = "produkt;anzahl;preis\r\n";
        let lines = Object.keys(productAmount).map((pa) => {
            const product = products.find(p => p._id.toString() === pa);
            const amount = productAmount[pa].amount;
            const name = product ? product.displayName : pa;
            const price = product ? product.itemPrice : 0;

            return `${name};${amount};${price}`;
        }).join("\r\n");

        return {
            user,
            csv: csv+lines,
        };
    });


    let fileName = args.output || 'Abrechnung-'+new Date().toISOString().split('T')[0]+'.zip';
    let path = require("path").join(__dirname, 'data', fileName);

    const zip = new AdmZip();

    csvs.forEach(csvU => {
        const { user, csv } = csvU;

        zip.addFile(`${user.firstname.replaceAll(" ", "_")}-${user.lastname.replaceAll(" ", "_")}-${user._id.toString()}.csv`, Buffer.from(csv, "utf-8"));
    });

    await new Promise((resolve, reject) => {
        return zip.writeZip(path, (err, str) => {
            if (err) return reject(err);
            return resolve(str);
        });
    });
})().then(() => process.exit(1));
const mongoose = require("mongoose");
const fs = require("fs/promises");

const { program } = require("commander");

program
	.requiredOption("-o --output <filename>", "JSON File to which to write users")
    .requiredOption("-u --url <mongo>", "MongoDB Connection String");

program.parse()

const args = program.opts();

mongoose.connect(args.url).then(async () => {
    const Account = mongoose.model("Account", new mongoose.Schema({}, { strict: false }));
    const Order = mongoose.model("Order", new mongoose.Schema({}, { strict: false }));
    const Product = mongoose.model("Product", new mongoose.Schema({}, { strict: false }));

    const accounts = await Account.find();
    const namesAndIds = accounts.map(acc => {
        return {
            id: acc._id.toString(),
            name: `${acc.lastname} ${acc.firstname}`,
        };
    });

    const usersWithOrders = (await Promise.all(namesAndIds.map(async user => {
        const hasOrder = await Order.findOne({ account: user.id });

        if (hasOrder) return user;
        console.log(user.name);
        return undefined;
    }))).filter(Boolean);

    await fs.writeFile(args.output, JSON.stringify(usersWithOrders));
}).then(() => {
    process.exit(1);
});
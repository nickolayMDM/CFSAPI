const nodemailer = require("nodemailer");
const validators = require("../helpers/validators");
const config = require("../config");
const file = require("./fileAdapter");
const textHelpers = require("../helpers/text");

const errorPrefix = "mailAdapter error: ";

class mail {
    async init() {
        await this.setTest(config.mailer.test);
        this.setTransporter({
            host: config.mailer.host,
            port: config.mailer.port,
            secure: config.mailer.secure,
            user: config.mailer.user,
            pass: config.mailer.password
        });
    }

    async setTest(value) {
        if (!validators.isBoolean(value)) {
            return false;
        }

        this._isTest = value;
        if (this._isTest) {
            this.testAccount = await nodemailer.createTestAccount();
        }
    }

    setTransporter({host, port, secure = false, user, pass} = {}) {
        if (
            (
                validators.isDefined(host)
                && !validators.isPopulatedString(host)
            )
            || !validators.isPositiveInt(port)
            || !validators.isBoolean(secure)
            || (
                !this._isTest
                && !validators.isPopulatedString(user)
            )
            || (
                !this._isTest
                && !validators.isPopulatedString(pass)
            )
        ) {
            console.log(host, port, secure, user, pass);
            throw Error(errorPrefix + "transporter input is incorrect");
        }

        let auth = {
            user,
            pass
        };
        if (this._isTest && validators.isPopulatedObject(this.testAccount)) {
            auth = {
                user: this.testAccount.user,
                pass: this.testAccount.pass
            };
        }

        this.transporter = nodemailer.createTransport({
            host,
            port,
            secure,
            auth
        });
    }

    async sendFile({from, to, subject, filesDirectory, substitutions = {}} = {}) {
        let filesDirectoryPath = "./mail/" + filesDirectory;
        if (!validators.isPopulatedString(subject)) {
            let subjectFile = new file();
            await subjectFile.setFromPath(filesDirectoryPath + "/subject.txt");
            subject = textHelpers.replacePlaceholders({
                body: subjectFile.returnString(),
                replacements: substitutions
            });
        }
        let textFile = new file();
        await textFile.setFromPath(filesDirectoryPath + "/text.txt");
        const text = textHelpers.replacePlaceholders({
            body: textFile.returnString(),
            replacements: substitutions
        });
        let bodyFile = new file();
        await bodyFile.setFromPath(filesDirectoryPath + "/body.html");
        const html = textHelpers.replacePlaceholders({
            body: bodyFile.returnString(),
            replacements: substitutions
        });

        let info = await this.send({
            from,
            to,
            subject,
            text,
            html
        });

        return info;
    }

    async send({from, to, subject, text, html}) {
        if (!validators.isDefined(this.transporter)) {
            throw Error(errorPrefix + "should create a transporter before sending mail");
        }
        if (
            !validators.isPopulatedString(to)
            || !validators.isPopulatedString(subject)
            || !validators.isPopulatedString(text)
            || !validators.isPopulatedString(html)
        ) {
            console.log(to, subject, text, html);
            throw Error(errorPrefix + "invalid input to send mail");
        }
        if (!validators.isPopulatedString(from)) {
            from = config.mailer.defaultFrom;
        }

        let info = await this.transporter.sendMail({
            from,
            to,
            subject,
            text,
            html
        });

        return info;
    }
}

module.exports = mail;
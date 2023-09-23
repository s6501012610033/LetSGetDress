const express = require('express')
const mysql = require('mysql');
const cors = require("cors")
const { networkInterfaces } = require('os');

const nets = networkInterfaces();
const results = Object.create(null); // Or just '{}', an empty object

for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
        // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
        // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
        const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
        if (net.family === familyV4Value && !net.internal) {
            if (!results[name]) {
                results[name] = [];
            }
            results[name].push(net.address);
        }
    }
}

const app =  express();
app.use(cors());
app.use(express.json()); //แปลงเป็น object

const token_obj = 'this is token'
const jwt = require('jsonwebtoken')

//MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'lets_get_dress'
})

connection.connect((err) =>{
    if (err) {
        console.log('Error connecting to MySQL database =', err)
        return;
    }
    console.log('MySQL successfully connected!');
})

//----------------------------Test--------------------------------------//
app.get("/test", (req, res) => {
    console.log("REQUEST GET");
    res.status(200).json({message: "SERVER OKAY"})
})

//----------------------------Sign up--------------------------------------//

//ตรวจสอบว่ามีแอคเค้าที่มีเมลนี้หรือยัง
app.get("/check_account/:email", async (req, res) => {
    const {password, confirm} = req.body;
    const email = req.params.email.slice(0,-1);

    try {
        connection.query(
            "SELECT * FROM account WHERE ACCOUNT_EMAIL = ?",
            [email], //แทน ?
            (err, results, fields) => {
                if (err) {
                    console.log(err);
                    return res.status(400).send();
                }
                if (results.map(item => item.ACCOUNT_EMAIL).toString() == email) {
                    return res.status(200).json({status:"fail" , message: "This email already has an account"});
                }
                res.status(200).json({status:email , message: "You can create new account with this email"});
            }
        )
    }
    catch(err) {
        console.log(err);
        return res.status(500).send();
    }
})	

//for sign up
app.post("/sign_up", async (req, res) => {
    const {email, password, confirm} = req.body

    try {
        fetch('http://192.168.1.49:3360/check_account/' + new URLSearchParams(email), {
            method: 'GET', 
        })
        .then(res => res.json())
        .then(status => {
            if (status.status == email) {
                // ตรวจสอบรหัสที่สร้างว่าเหมือนกันมั้ย
                if (password != confirm) {
                    return res.status(400).json({status:"fail", message: "Password must be the same"});
                }
                connection.query(
                    //เพิ่มข้อมูลลง db
                    "INSERT INTO account(ACCOUNT_EMAIL, ACCOUNT_PASSWORD) VALUES(?, ?)", //insert ข้อมูล
                    [email, password], //แทน ?
                    (err, results, fields) => {
                        if (err) {
                            console.log("Error while inserting an account into the database", err);
                            return res.status(400).json({status:"fail", message: "Error while inserting an account into the database"});
                        }
                        return res.status(201).json({status:"success", message: "New user successfully created!"});
                    }
                )
            }
            if (status.status == "fail") {
                res.status(400).json({status:"fail", message: "This email already has an account"})
            }
        })  
    }
    catch(err) {
        console.log(err);
        return res.status(500).send();
    }
})	

//----------------------------Fill information--------------------------------------//

//for fill your information
app.post("/fill_information", async (req, res) => {
    const {weight, height, bust, waist, hip, email} = req.body

    try {
        //ใส่ข้อมูลครบทุกอันมั้ย
        if (weight.toString().length != 0 && height.toString().length != 0 && bust.toString().length != 0 && waist.toString().length != 0 && hip.toString().length != 0) {
            //ต้องกรอกแค่ตัวเลขเท่านั้น
            if (Number.isFinite(Number(weight)) && Number.isFinite(Number(height)) && Number.isFinite(Number(bust)) && Number.isFinite(Number(waist)) && Number.isFinite(Number(hip))) {
                connection.query(
                    //เพิ่มข้อมูลลง db
                    "UPDATE account SET WEIGHT = ?, HEIGHT = ?,BUST = ?, WAIST = ?, HIP = ?  WHERE ACCOUNT_EMAIL = ?", //insert ข้อมูล
                    [weight, height, bust, waist, hip, email],
                    (err, results, fields) => {
                        if (err) {
                            console.log("Error while updating an information of the database", err);
                            return res.status(400).json({status:"fail", message: "Error while updating an information of the database"});
                        }
                    }
                )
                return res.status(200).json({status:"success", message: "Your information successfully updated"})
            }
            return res.status(400).json({status:"fail", message: "ํTheese information should only be numbers"})
        }
        res.status(400).json({status:"fail", message: "You need to fill all informations"})
    }
    catch(err) {
        console.log(err);
        return res.status(500).send();
    }
})

//----------------------------Login--------------------------------------//

//for login
app.get("/login", async (req, res) => {
    const email = req.body.email
    const password = req.body.password;
    try {
        connection.query(
            "SELECT * FROM account WHERE ACCOUNT_EMAIL = ? ", //ดึงข้อมูล
            [email],
            (err, results, fields) => {
                if (err) {
                    console.log(err);
                    return res.status(400).send();
                }
                //เช้คว่า email&password ถูกมั้ย
                if (results.map(item => item.ACCOUNT_PASSWORD).toString() != password) { //แปลง results เป็น string
                    return res.status(404).send({status:"fail", message: "Email or Password is incorrect"}); 
                }
                const token = jwt.sign({ email : results.map(item => item.ACCOUNT_EMAIL).toString()}, token_obj, {expiresIn: '1h'}); //token to verify email
                res.status(200).json({status:"sucess", message: "Login successfully!", token});
            })
    }
    catch(err) {
        console.log(err);
        return res.status(500).send();
    }
})

// ปุ่ม forgot password
app.get("/forgot_password", async (req, res) => {
    const email = req.body.email;

    try {
        connection.query(
            "SELECT * FROM account WHERE ACCOUNT_EMAIL = ?",
            [email],
            (err, results, fields) => {
                if (err) {
                    console.log(err);
                    return res.status(400).send();
                }
                //เช้คว่ามีอีเมลนี้ใน db มั้ย
                if (results.length == 0) {
                    return res.status(400).json({status:"fail", message: "No account with this email"});
                }
                res.status(200).json({status:"success", message: "There is an account with this email"});
            }
        )
    }
    catch(err) {
        console.log(err);
        return res.status(500).send();
    }
})

//----------------------------Verify reset password code--------------------------------------//

//verify OTP
app.get("/verify_OTP", async (req, res) => {
    const {email, otp1, otp2, otp3, otp4} = req.body;
    try {
        if (otp1 == 1 && otp2 == 1 && otp3 == 1 && otp4 ==1) {
            return res.status(200).json({status:"success", message: "OTP is correct"});
        }
        res.status(400).json({status:"fail", message: "OTP is incorrect"});
    }
    catch(err) {
        console.log(err);
        return res.status(500).send();
    }
})

//----------------------------Reset password--------------------------------------//

//for reset password
app.post("/reset_password", async (req, res) => {
    const {email, password, confirm} = req.body

    try {
        //เช้คว่า password ตรงกันมั้ย
        if (confirm != password) {
            return res.status(400).json({status:"fail", message: "Password must be the same"});
        }

        connection.query(
            //อัพเดตข้อมูลใน db
            "UPDATE account SET ACCOUNT_PASSWORD = ? WHERE ACCOUNT_EMAIL = ?",
            [password, email], //แทน ?
            (err, results, fields) => {
                if (err) {
                    console.log("Error while inserting a user into the database", err);
                    return res.status(400).send();
                }
                return res.status(201).json({status:"success", message: "New password successfully update!"});
            }
        )
    }
    catch(err) {
        console.log(err);
        return res.status(500).send();
    }
})	

//----------------------------See profile--------------------------------------//

//for see profile IS_PREMIUM ไว้บอกว่าตอนนี้บัญชีนั้นอยู่ในเวอร์ชั่นอะไร 0 = user ปกติ 1 = premium
app.get("/profile", async (req, res) => {
    const email = req.body.email
    try {
        connection.query(
            //ดึงข้อมูลของแอคเค้ามา
            "SELECT * FROM account WHERE ACCOUNT_EMAIL = ?",
            [email],
            (err, results, fields) => {
                if (err) {
                    console.log("Error while connecting to the database", err);
                    return res.status(400).send();
                }
                if (results.length === 0)
                {
                    return res.status(400).json({status:"fail", message: "Error, Can't find this email in the database"});
                }
                res.status(200).json({status:"success", message: results});
            }
        )
    }
    catch(err) {
        console.log(err);
        return res.status(500).send();
    }
})

//----------------------------Edit profile--------------------------------------//

//just search profile
app.get("/search_profile/:email", async (req, res) => {
    const email = req.params.email.slice(0,-1)
    try {
        connection.query(
            //ดึงข้อมูลของแอคเค้ามา
            "SELECT * FROM account WHERE ACCOUNT_EMAIL = ?",
            [email],
            (err, results, fields) => {
                if (err) {
                    console.log("Error while connecting to the database", err);
                    return res.status(400).send();
                }
                if (results.length === 0)
                {
                    return res.status(400).json({status:"fail", message: "Error, Can't find this email in the database"});
                }
                res.status(200).json({status:"success", message: results});
            }
        )
    }
    catch(err) {
        console.log(err);
        return res.status(500).send();
    }
})

//for edit profile รวมทั้ง premium และปกติ email = เดิม newemail = email ใหม่
app.patch("/edit_profile", async (req, res) => {
    const {email, weight, height, bust, waist, hip, newemail, password} = req.body

    try {
        fetch('http://192.168.1.49:3360/search_profile/' + new URLSearchParams(email), {
        method: 'GET'
    })
    .then(res => res.json())
    .then(status => {
        //ดึงเลข id มาเพื่ออัพเดตแถวนั้น
        if (status.status == "success") {
            //ส่งข้อมูลมาครบถ้วนมั้ย
            if (weight.toString().length != 0 && height.toString().length != 0 && bust.toString().length != 0 && waist.toString().length != 0 && hip.toString().length != 0 && newemail.length != 0 && password.length != 0) {
                //ต้องกรอกแค่ตัวเลขเท่านั้น
                if (Number.isFinite(Number(weight)) && Number.isFinite(Number(height)) && Number.isFinite(Number(bust)) && Number.isFinite(Number(waist)) && Number.isFinite(Number(hip))) {
                    connection.query(
                        "UPDATE account SET ACCOUNT_EMAIL = ?, ACCOUNT_PASSWORD = ?, WEIGHT = ?, HEIGHT = ?, BUST = ?, WAIST = ?, HIP = ? WHERE ACCOUNT_ID = ?",
                        [newemail, password, weight, height, bust, waist, hip, status.message[0].ACCOUNT_ID],
                        (err, results, fields) => {
                            if (err) {
                                console.log(err);
                                return res.status(400).send();
                            }
                        })
                        return res.status(200).json({status:"success", message : "Profile updated successfully!"})
                }
                return res.status(400).json({status:"fail", message : "ํTheese information should only be numbers"})
            }
            return res.status(400).json({status:"fail", message : "You need to fill all informations"})
        }
        return res.status(400).json({status:"fail", message : "Error, Can't find this email in the database"})
    })}
    catch(err) {
        console.log(err);
        return res.status(500).send();
    }
})

//----------------------------Payment Detail--------------------------------------//

//for payment detail payment method, next bill date
app.get("/payment_detail", async (req, res) => {
    const email = req.body.email

    try {
        connection.query(
            "SELECT premium.PAYMENT_METHOD, DATE_FORMAT(premium.NEXT_BILL_DATE, '%d %M %Y') AS NEXT_BILL_DATE FROM account JOIN premium WHERE account.ACCOUNT_ID = premium.ACCOUNT_ID AND account.ACCOUNT_EMAIL = ?",
            [email],
            (err, results, fields) => {
                if (err) {
                    console.log(err);
                    return res.status(400).send();
                }
                if (results.length === 0)
                {
                    return res.status(400).json({status:"fail", message: "Error, Can't find this email in the database"});
                }
                return res.status(200).json({status:"success", message : "Get information successfully!", results: results})
            }
        )
    }
    catch(err) {
        console.log(err);
        return res.status(500).send();
    }
})

//for payment detail history
app.get("/payment_history", async (req, res) => {
    const email = req.body.email

    try {
        connection.query(
            "SELECT DATE_FORMAT(history.bill_date, '%d %M %Y') AS BILL_DATE FROM account JOIN premium ON account.ACCOUNT_ID = premium.ACCOUNT_ID JOIN history ON account.ACCOUNT_ID = history.ACCOUNT_ID AND account.ACCOUNT_EMAIL = ?",
            [email],
            (err, results, fields) => {
                if (err) {
                    console.log(err);
                    return res.status(400).send();
                }
                if (results.length === 0)
                {
                    return res.status(400).json({status:"fail", message: "Error, Can't find this email in the database"});
                }
                return res.status(200).json({status:"success", message : "Get information successfully!", results: results})
            }
        )
    }
    catch(err) {
        console.log(err);
        return res.status(500).send();
    }
})

//----------------------------Cancel Premium--------------------------------------//

//for cancel premium overlay confirm = คำตอบของ Are you sure to cancel Premium? yes/no
app.patch("/cancel_premium", async (req, res) => {
    const {confirm,email} = req.body

    try {
        if (confirm == "yes") {
            connection.query(
                "UPDATE premium JOIN account SET STATUS = 0 WHERE account.ACCOUNT_ID = premium.ACCOUNT_ID AND account.ACCOUNT_EMAIL = ?",
                [email],
                (err, results, fields) => {
                    if (err) {
                        console.log(err);
                        return res.status(400).send();
                    }
                }
            )
            return res.status(200).json({status:"success", message : "Cancel premium successfully!"})
        }
        res.status(400).json({status:"fail", message : "Doesn't cancel premium yet"})
    }
    catch(err) {
        console.log(err);
        return res.status(500).send();
    }
})

//----------------------------ข้างล่างไม่ใช้มั้ง--------------------------------------//

//ดึงข้อมูล account ทั้งหมด
app.get("/read_account", async (req, res) =>{
    try {
        connection.query(
            "SELECT * FROM account", //ดึงข้อมูล
            (err, results, fields) => {
                if (err) {
                    console.log(err);
                    return res.status(400).send();
                }
                res.status(200).json(results)
            })
    }
    catch(err) {
        console.log(err);
        return res.status(500).send();
    }
})

//read single ดึงแค่ข้อมูล account ที่ต้องการ
app.get("/read_account/single/:email", async (req, res) =>{
    const email = req.params.email; //รับตัวแปร email
    try {
        connection.query(
            "SELECT * FROM account WHERE ACCOUNT_EMAIL = ?", //ดึงข้อมูล
            [email],
            (err, results, fields) => {
                if (err) {
                    console.log(err);
                    return res.status(400).send();
                }
                res.status(200).json(results)
            })
    }
    catch(err) {
        console.log(err);
        return res.status(500).send();
    }
})

//DELETE ลบ account
app.delete("/delete_account/:email", async (req, res) => {
    const email = req.params.email;
    try {
        connection.query(
            "DELETE FROM account WHERE ACCOUNT_EMAIL = ?", //ดึงข้อมูล
            [email],
            (err, results, fields) => {
                if (err) {
                    console.log(err);
                    return res.status(400).send();
                }
                if (results.affectedRow === 0) {
                    return res.status(404).json({ message: "No account with that email"})
                }
                res.status(200).json({ message: "account deleted successfully!"})
            })
    }
    catch(err) {
        console.log(err);
        return res.status(500).send();
    }

})

//filter premium กรองเฉพาะแอคที่ใช้ premium อยู่
app.get("/premium_account/:IS_PREMIUM", async (req, res) =>{
    const IS_PREMIUM = req.params.IS_PREMIUM;
    try {
        connection.query(
            "SELECT * FROM account WHERE IS_PREMIUM = ?", //ดึงข้อมูล
            [IS_PREMIUM],
            (err, results, fields) => {
                if (err) {
                    console.log(err);
                    return res.status(400).send();
                }
                res.status(200).json(results)
            })
    }
    catch(err) {
        console.log(err);
        return res.status(500).send();
    }
})

//join account and premium table กรองเฉพาะแอคที่สมัคร premium หรือเคยสมัคร
app.get("/join_premium_account", async (req, res) =>{
    try {
        connection.query(
            "SELECT * FROM account JOIN premium WHERE account.ACCOUNT_ID = premium.ACCOUNT_ID", //ดึงข้อมูล
            (err, results, fields) => {
                if (err) {
                    console.log(err);
                    return res.status(400).send();
                }
                res.status(200).json(results)
            })
    }
    catch(err) {
        console.log(err);
        return res.status(500).send();
    }
})

//format next bill date ตั้งเวลา next bill date เป็น 28 วันถัดไปจากปัจจุบัน
app.patch("/format_date", async (req, res) => {
    try {
        connection.query(
            "UPDATE premium SET NEXT_BILL_DATE = DATE_ADD(CURRENT_DATE(), INTERVAL 28 DAY)", //ดึงข้อมูล
            (err, results, fields) => {
                if (err) {
                    console.log(err);
                    return res.status(400).send();
                }
                res.status(200).json({message : "Account updated password successfully!"})
            })
    }
    catch(err) {
        console.log(err);
        return res.status(500).send();
    }

})

//มี account อยู่รึเปล่า
app.get("/is_have_account/:email", async (req, res) =>{
    const email = req.params.email; //รับตัวแปร email
    try {
        connection.query(
            "SELECT * FROM account WHERE ACCOUNT_EMAIL = " + mysql.escape(email), //ดึงข้อมูลแบบระวังแฮคมั้ง
            (err, results, fields) => {
                if (err) {
                    console.log(err);
                    return res.status(400).send();
                }
                if (results == '') {
                        return res.status(404).json({message: "No account with this email"})
                    }
                res.status(200).json(results)
            })
    }
    catch(err) {
        console.log(err);
        return res.status(500).send();
    }
})

//UPDATE data เปลี่ยน password
app.patch("/update_account/:email", async (req, res) => {
    const email = req.params.email
    const newPassword = req.body.newPassword;
    try {
        connection.query(
            "UPDATE account SET ACCOUNT_PASSWORD = ? WHERE ACCOUNT_EMAIL = ?", //ดึงข้อมูล
            [newPassword, email],
            (err, results, fields) => {
                if (err) {
                    console.log(err);
                    return res.status(400).send();
                }
                res.status(200).json({message : "Account updated password successfully!"})
            })
    }
    catch(err) {
        console.log(err);
        return res.status(500).send();
    }

})

//เพิ่ม account ใหม่
app.post("/create_account", async (req, res) => {
    const {email, password} = req.body

    try {
        connection.query(
            "INSERT INTO account(ACCOUNT_EMAIL, ACCOUNT_PASSWORD) VALUES(?, ?)", //insert ข้อมูล
            [email, password], //แทน ?
            (err, results, fields) => {
                if (err) {
                    console.log("Error while inserting a user into the database", err);
                    return res.status(400).send();
                }
                return res.status(201).json({message: "New user successfully created!"});
            }
        )
    }
    catch(err) {
        console.log(err);
        return res.status(500).send();
    }
})	

app.listen(3360, results['Wi-Fi'][0], () => console.log('Server is running on port', results['Wi-Fi'][0],':3360'));
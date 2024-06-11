const crypto = require("crypto");
const { transporter } = require("../config/mail");
const db = require("../config/db");

require("dotenv").config();

const verifikasi_token = async (req, res) => {
	const { __token_verification } = req.body;
	const results = await db.query(
		"SELECT * FROM unverified_emails WHERE verification_token = $1",
		[__token_verification]
	);

	if (results.rows.length === 0) {
		return res.status(400).json({
			response: false,
			message:
				"Maaf, token anda tidak valid, sepertinya token anda telah expired, silahkan tekan tombol kirim link verifikasi kembali!",
		});
	}

	// deleting verified token when verification_link is entered
	// db.query('DELETE FROM unverified_emails WHERE verification_token = $1', [__token_verification]);

	res.json({
		response: true,
		message:
			"Selamat, token anda telah berhasil di verifikasi, kini anda diarahkan ke halaman pengisian form!",
		results: results.rows[0],
	});
};

const kirim_link_verifikasi = async (req, res) => {
	// mengambil data email dari user
	const { email } = req.body;

	// mengecek apakah email tersebut sudah pernah terdaftar
	const resultInAkun = await db.query("SELECT * FROM akun WHERE email = $1", [
		email,
	]);
	if (resultInAkun.rows.length > 0) {
		return res
			.status(400)
			.json({
				response: false,
				message:
					"Maaf, Email tersebut telah terdaftar di sistem kami sebelumnya!",
			});
	}

	// mengecek apakah email tersebut belum terdaftar tetapi sudah pernah dikirimin token
	const resultInUnverifiedEmails = await db.query(
		"SELECT * FROM unverified_emails WHERE email = $1",
		[email]
	);
	if (resultInUnverifiedEmails.rows.length > 0) {
		// mengambil waktu expire token di database
		const getExpiresAt = resultInUnverifiedEmails.rows[0].expires_at;

		// mendapatkan waktu sekarang
		const now = new Date();

		// Menghitung selisih antara kedua waktu
		const diffTime = Math.abs(now - getExpiresAt);

		// konversi ke menit detik
		const diffMinutes = Math.ceil(diffTime / (1000 * 60));
		const diffSeconds = Math.ceil(diffTime / 1000);

		return res
			.status(400)
			.json({
				response: false,
				message: `Maaf, kami telah mengirimkan link verifikasi ke email tersebut sebelumnya coy, silahkan coba kembali sekitar ${diffMinutes}-menitan atau lebih tepatnya ${diffSeconds}-detik lagi ya coy!`,
			});
	}

	// pembuatan token dan verifikasi link yang akan dikirim ke email
	const token = crypto.randomBytes(32).toString("hex");
	const verificationLink = process.env.VERIFICATION_LINK + token;

	const mailOptions = {
		from: process.env.EMAIL_USER,
		to: email,
		subject:
			"[SIPTATIF VERIFICATION] - Verifikasi Email untuk Registrasi Akun SIPTATIF",
		html: `
        <html>
            <head>
                <style>
                    .email-container {
                        width: 100%;
                        padding: 20px;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        background-color: #f9f9f9;
                    }
                    .email-card {
                        width: 100%;
                        background-color: #fff;
                        padding: 20px;
                        border-radius: 10px;
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                        font-family: Arial, sans-serif;
                    }
                    .email-header {
                        font-size: 20px;
                        font-weight: bold;
                        margin-bottom: 20px;
                        text-align: center;
                    }
                    .email-body {
                        font-size: 16px;
                        line-height: 1.5;
                        margin-bottom: 30px;
                    }
                    .email-button {
                        display: inline-block;
                        padding: 10px 20px;
                        font-size: 16px;
                        color: #ffffff;
                        background-color: #4CAF50;
                        text-align: center;
                        text-decoration: none;
                        border-radius: 5px;
                        transition: background-color 0.3s ease;
                    }
                    .email-button:hover {
                        background-color: #298040;
                    }
                    .email-footer {
                        font-size: 14px;
                        color: #555;
                        text-align: center;
                        margin-top: 20px;
                    }
                </style>
            </head>
            <body>
                <div class="email-container">
                    <div class="email-card">
                        <div class="email-header">
                            📧 Verifikasi Email Akun SIPTATIF 📧
                        </div>

                        <div class="email-body">
                            <h4><i>Halo Sobat SIPTATIF UIN Suska Riau,</i><span> 😁😉</span></h4>
                            <p>Terima kasih telah mendaftar akun di SIPTATIF. Silakan klik tombol di bawah ini untuk memverifikasi alamat email Anda: 👇</p>
                            <p style="text-align: center;">
                                <a style="color: #ffffff; text-decoration: none" href="${verificationLink}" class="email-button">Verifikasi Email Sekarang</a>
                            </p>
                            <p>Jika Anda tidak meminta email ini, abaikan saja. 😊</p>
                        </div>
                        <div class="email-footer">
                            Hormat kami,<br/>Tim Dev SIPTATIF [M. Farhan Aulia Pratama & Farhan Fadhila]
                        </div>
                    </div>
                </div>
            </body>
        </html>
        `,
	};

	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			return res.status(500).json({
				response: false,
				message: "Maaf, sepertinya email anda tidak tepat!",
			});
		}
	});

	// generate token expires
	const expiresAt = new Date(Date.now() + 180000); // 3 minutes from now will expire

	// insert into unverified_emails with token
	db.query(
		"INSERT INTO unverified_emails (email, verification_token, expires_at) VALUES ($1, $2, $3)",
		[email, token, expiresAt]
	);

	return res.status(200).json({
		response: true,
		message: `Sukses mengirim link verifikasi ke email ${email}! silahkan cek, lalu tekan tombol 'Verifikasi Email Sekarang' untuk memverifikasinya!`,
	});
};

// importing hash algorithm
const argon2 = require("argon2");

const register_akun_mahasiswa = async (req, res) => {
	// mengambil data email dari user
	const { email, password, nim, nama, tanggal_lahir, no_hp } = req.body;

    // hashing password with argon2 algorithm and catch error
    let hashPassword;
	try {
        hashPassword = await argon2.hash(password);
	} catch (err) {
        return res.status(500).json({
            response: false,
            message: err.message,
        });	
    }

    // call procedure register_akun_mahasiswa to regist user account
    try{
        // query execution
        await db.query(
            "CALL register_akun_mahasiswa( $1, $2, $3, $4, $5, $6 )",
            [email, hashPassword, nim, nama, tanggal_lahir, no_hp]
        );
        // return success response
        return res.status(200).json({
            response: true,
            message: `Yeay, registrasi sukses!, sebentar ya, kami akan mengarahkan kamu kehalaman login.`,
        });
    } catch (err) {
        const errCode = err?.code;
        if (errCode === "23505") { // unique_violation
            return res.status(500).json({
                response: false,
                message: `Registrasi Gagal! ${err.detail.replace("Kunci", "Data anda, yakni").replace("sudah ada.", "sudah pernah didaftarkan.")}`,
            });
        } else {
            return res.status(500).json({
                response: false,
                message: `Registrasi Gagal! ${err.message}`,
            });
        }
    }
};

module.exports = {
	verifikasi_token,
	kirim_link_verifikasi,
	register_akun_mahasiswa,
};

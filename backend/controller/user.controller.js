const registerUser = (req, res) => {
    try {
        res.status(200).json({ message: "ok" })
    }
    catch (err) {
        res.status(500).json({ message: "error :", err })
    }

}
module.exports = {registerUser}; 
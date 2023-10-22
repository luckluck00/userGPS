const getUsers = "SELECT * FROM users";
const getUser = "SELECT * FROM users WHERE id = $1";
const checkEmailExists = "SELECT s FROM users s WHERE s.email = $1";
const checkHashPassword = "SELECT s FROM users s WHERE s.email = $1";
const CreatUser = "INSERT INTO users (email, phonenumber, password, dob) VALUES ($1, $2, $3, $4) RETURNING id";
const CreateUser_name_photo = "UPDATE users SET name = $1, img_path = $2, user_img = $3 WHERE id = (SELECT id FROM users ORDER BY id DESC LIMIT 1) RETURNING *";
const getUserImg = "SELECT img_path FROM users WHERE id = $1";
const getUserIdFromEmail = "SELECT id FROM users WHERE email = $1";
const User_login = "SELECT password FROM users WHERE email = $1";
const GetlastUserId = "SELECT id FROM users ORDER BY id DESC LIMIT 1";
const DeleteUser = "DELETE FROM users WHERE id = $1";
const getUserName = "SELECT name FROM users WHERE id = $1";
const getNameFromEmail = "SELECT name FROM users WHERE email = $1";
const getUserimgFromEmail = "SELECT img_path FROM users WHERE email = $1";
const ChangeUserName = "UPDATE users SET name = $1 WHERE id = $2;";
const ChangeUserImg = "UPDATE users SET img_path = $1, user_img = $2 WHERE id = $3";
const getDriverState = "SELECT driverState FROM users WHERE id = $1";

module.exports = {
    getUsers,getUser, CreatUser, checkEmailExists, User_login, checkHashPassword, DeleteUser, GetlastUserId, CreateUser_name_photo, getUserImg, getUserIdFromEmail, getUserName , ChangeUserName,
    ChangeUserImg, getNameFromEmail, getUserimgFromEmail,getDriverState
}
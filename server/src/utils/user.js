exports.validate_password = (password) => {
    let message = "";
    let is_valid = true;

    if (!password || password.length < 8) {
        is_valid = false;
        message = "Password must be at least 8 characters long.";
    }

    return { is_valid, message };
};

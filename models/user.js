const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username cannot be blank']
    },
    password: {
        type: String,
        required: [true, 'Password cannot be blank']
    }
});

// add methods to the User class through statics, not just a particular instance
userSchema.statics.findAndValidate = async function (username, password) {
    // this refers to particular schema
    console.log(this);
    const foundUser = await this.findOne({ username });
    const isValid = await bcrypt.compare(password, foundUser.password);
    return isValid? foundUser: false;
}

module.exports = mongoose.model('User', userSchema);
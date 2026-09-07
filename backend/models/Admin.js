import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const adminSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true, default: "Admin Member" },
    email: { type: String, trim: true, default: "" },
    role: { type: String, enum: ["Super Admin", "Admin", "Editor"], default: "Admin" },
    department: { type: String, trim: true, default: "ICT Group" },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

adminSchema.methods.verifyPassword = function (plain) {
  return bcrypt.compareSync(plain, this.passwordHash);
};

adminSchema.statics.createFromPlain = async function (data, plain) {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(plain, salt);
  if (typeof data === "string") {
    return this.create({ username: data, name: data, passwordHash: hash });
  }
  return this.create({ ...data, passwordHash: hash });
};

const Admin = mongoose.model("Admin", adminSchema);
export default Admin;

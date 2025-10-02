import mongoose from "mongoose";

const keySchema = new mongoose.Schema(
  {
    name: { type: String, index: true }, // optional name for the key
    key: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true }, //  the user who stored the key id
    provider: {
      type: String,
      enum: ["mailchimp", "getresponse"],
      required: true,
    }, // Used enum for easy filtering
  },
  { timestamps: true }
);

//Auto generate a default name for each key serially (new key 1)
keySchema.pre("save", async function (next) {
  //Check if the key is new and if the name is empty and then give it the default name
  if (this.isNew && !this.name) {
    const Key = mongoose.models.Key || mongoose.model("Key", keySchema);
    const count = await Key.countDocuments({ userId: this.userId }); // Count existing keys for the user
    this.name = `${this.provider} key ${count + 1}`; // output should be like mailchimp key 1 or getreponse key 1
  }
  next();
});

//If the user actually give the key a name no need to give it a default name  so jus save
const Key = mongoose.model("Key", keySchema);

export default Key;

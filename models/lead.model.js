const mongoose = require("mongoose")

const leadSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Lead name is required']
    },

    source: {
        type: String,
        required: [true, 'Lead source is required'],
        enum: ['Website', 'Referral', 'Cold Call', 'Advertisement', 'Email', 'Other']

    },

    salesAgent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent', 
    required: [true, 'Sales Agent is required'],
  },

  status: {
    type: String,
    required: true,
    enum: ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Closed']
  },

   tags: {
    type: [String],  
  },

  timeToClose: {
    type: Number,
    required: [true, 'Time to Close is required'],
    min: [1, 'Time to Close must be a positive number']
  },

  priority: {
    type: String,
    required: true,
    enum: ['High', 'Medium', 'Low'], 
    default: 'Medium',
  },

   closedAt: {
    type: Date, 
    default: null,
  },

},{ timestamps: true } )

leadSchema.pre('save', function (next) {
    if(this.status === 'Closed'){
         this.closedAt = new Date();
    } else if (this.isModified('status') && this.closedAt) {
    this.closedAt = null;
  }

   next();
})

leadSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();

  if (update.status === 'Closed') {
    update.closedAt = new Date();
  } else if (update.status && update.status !== 'Closed') {
    update.closedAt = null;
  }

  next();
});

const Lead = mongoose.model("Lead", leadSchema)

module.exports = Lead
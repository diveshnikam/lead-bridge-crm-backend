// Import models (MongoDB schema)
const Agent = require("./models/agent.model");
const Comment = require("./models/comment.model");
const Lead = require("./models/lead.model");

const { initDatabse } = require("./db/db.connect");
const mongoose = require("mongoose");

// Import DB connection helper
initDatabse();

// Import required packages

const express = require("express");
const app = express();
const cors = require("cors");

//Setup CORS (Cross-Origin Resource Sharing) so your frontend can call your backend API

const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Allow server to parse JSON request bodies

app.use(express.json());

//add new Agent

const AddAgent = async (data) => {
  try {
    const { name, email } = data;

    if (!name || !email) {
      throw { status: 400, message: "Both name and email are required." };
    }

    const emailRegex = /^\S+@\S+\.\S+$/;

    if (!emailRegex.test(email)) {
      throw {
        status: 400,
        message: "Invalid input: 'email' must be a valid email address.",
      };
    }

    const existingAgent = await Agent.findOne({ email });
    if (existingAgent) {
      throw {
        status: 409,
        message: `Sales agent with email '${email}' already exists.`,
      };
    }

    const newAgent = new Agent(data);
    return await newAgent.save();
  } catch (error) {
    throw error;
  }
};

app.post("/agents", async (req, res) => {
  try {
    const data = await AddAgent(req.body);
    res.status(201).json(data);
  } catch (error) {
    res.status(error.status || 500).json({
      error: error.message || "Failed to add sales agent.",
    });
  }
});

// Get All Agents

const getAllAgents = async () => {
  try {
    const data = await Agent.find();
    return data;
  } catch (error) {
    throw error;
  }
};

app.get("/agents", async (req, res) => {
  try {
    const data = await getAllAgents();

    if (data.length === 0) {
      return res.status(404).json({ message: "No agents found." });
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch agents.",
      errorMessage: error.message,
    });
  }
});

//Delete Agent

const deleteAgent = async (id) => {
  try {
    const data = await Agent.findByIdAndDelete(id);
    return data;
  } catch (error) {
    throw error;
  }
};

app.delete("/agents/:id", async (req, res) => {
  try {
    const data = await deleteAgent(req.params.id);

    if (!data) {
      return res.status(404).json({ message: "Agent not found." });
    }

    res
      .status(200)
      .json({ message: "Agent deleted successfully.", deletedAgent: data });
  } catch (error) {
    res.status(500).json({
      error: "Failed to delete agent.",
      errorMessage: error.message,
    });
  }
});

//Update Agent

const editAgent = async (id, agentData) => {
  try {
    const { name, email } = agentData;

    if (!name || !email) {
      throw { status: 400, message: "Both name and email are required." };
    }

    if (email) {
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(email)) {
        throw { status: 400, message: "Invalid email format." };
      }
    }

    const updatedAgent = await Agent.findByIdAndUpdate(id, agentData, {
      new: true,
    });

    return updatedAgent;
  } catch (error) {
    throw error;
  }
};

app.post("/agents/:id", async (req, res) => {
  try {
    const data = await editAgent(req.params.id, req.body);

    if (!data) {
      return res.status(404).json({ message: "Agent not found." });
    }

    res.status(200).json({
      message: "Agent updated successfully.",
      updatedAgent: data,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      error: error.message || "Failed to update agent.",
    });
  }
});

//Add New Lead

const addnewLead = async (data) => {
  try {
    const { name, source, salesAgent, status, tags, timeToClose, priority } =
      data;

    if (!name) {
      throw {
        status: 400,
        message: "Lead name is required.",
      };
    }

    if (!source) {
      throw {
        status: 400,
        message: "Lead Source is required",
      };
    }

    if (!salesAgent) {
      throw {
        status: 400,
        message: "Sales Agent ID is required.",
      };
    }

    if (!timeToClose) {
      throw {
        status: 400,
        message: "Time to close is required.",
      };
    }

    if (!priority) {
      throw {
        status: 400,
        message: "Priority is required",
      };
    }

    if (!status) {
      throw {
        status: 400,
        message: "Status is required",
      };
    }

    const validSources = [
      "Website",
      "Referral",
      "Cold Call",
      "Advertisement",
      "Email",
      "Other",
    ];
    if (!validSources.includes(source)) {
      throw {
        status: 400,
        message: `Invalid source. Must be one of: ${validSources.join(", ")}`,
      };
    }

    const validStatus = [
      "New",
      "Contacted",
      "Qualified",
      "Proposal Sent",
      "Closed",
    ];
    if (!validStatus.includes(status)) {
      throw {
        status: 400,
        message: `Invalid status. Must be one of: ${validStatus.join(", ")}`,
      };
    }

    const validPriority = ["High", "Medium", "Low"];
    if (!validPriority.includes(priority)) {
      throw {
        status: 400,
        message: `Invalid priority. Must be one of: ${validPriority.join(
          ", "
        )}`,
      };
    }

    if (tags) {
      if (!Array.isArray(tags)) {
        throw { status: 400, message: "Tags must be an array of strings." };
      }
    }

    if (typeof timeToClose !== "number" || timeToClose <= 0) {
      throw {
        status: 400,
        message: "Time to close must be a positive number.",
      };
    }

    if (!mongoose.Types.ObjectId.isValid(salesAgent)) {
      throw { status: 400, message: "Invalid Sales Agent ID format." };
    }

    const agent = await Agent.findById(salesAgent);
    if (!agent) {
      throw { status: 404, message: "Sales Agent not found." };
    }

    const newLead = new Lead({
      name,
      source,
      salesAgent,
      status,
      tags: tags || [],
      timeToClose,
      priority,
    });

    const savedLead = await newLead.save();
    return savedLead;
  } catch (error) {
    throw error;
  }
};

app.post("/leads", async (req, res) => {
  try {
    const savedLead = await addnewLead(req.body);
    res.status(201).json({
      success: true,
      message: "Lead created successfully.",
      data: savedLead,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Something went wrong.",
    });
  }
});

//Get all Leads

const getAllLeads = async (filters) => {
  try {
    const { salesAgent, status, source, priority, sort } = filters;
    const query = {};

    if (salesAgent) {
      if (!mongoose.Types.ObjectId.isValid(salesAgent)) {
        throw { status: 400, message: "Invalid Sales Agent ID format." };
      }
      query.salesAgent = salesAgent;
    }

    const validStatus = [
      "New",
      "Contacted",
      "Qualified",
      "Proposal Sent",
      "Closed",
    ];
    if (status) {
      if (!validStatus.includes(status)) {
        throw {
          status: 400,
          message: `Invalid status. Must be one of: ${validStatus.join(", ")}`,
        };
      }
      query.status = status;
    }

    const validSources = [
      "Website",
      "Referral",
      "Cold Call",
      "Advertisement",
      "Email",
      "Other",
    ];
    if (source) {
      if (!validSources.includes(source)) {
        throw {
          status: 400,
          message: `Invalid source. Must be one of: ${validSources.join(", ")}`,
        };
      }
      query.source = source;
    }

    const validPriorities = ["High", "Medium", "Low"];
    if (priority) {
      if (!validPriorities.includes(priority)) {
        throw {
          status: 400,
          message: `Invalid priority. Must be one of: ${validPriorities.join(
            ", "
          )}`,
        };
      }
      query.priority = priority;
    }

    let sortOption = {};
    const validSort = ["High", "Low"];

    if (sort) {
      if (!validSort.includes(sort)) {
        throw {
          status: 400,
          message: `Invalid Sort. Must be one of: ${validSort.join(", ")}`,
        };
      }

      if (sort === "Low") {
        sortOption = { timeToClose: 1 };
      } else if (sort === "High") {
        sortOption = { timeToClose: -1 };
      }
    }

    const leads = await Lead.find(query)
      .populate("salesAgent", "name email")
      .sort(sortOption);

    if (leads.length === 0) {
      return {
        status: 404,
        success: false,
        message:
          filters && Object.keys(filters).length > 0
            ? "Filter applied — no leads found."
            : "No leads available in the system yet.",
        data: [],
      };
    }

    return leads;
  } catch (error) {
    throw error;
  }
};

app.get("/leads", async (req, res) => {
  try {
    const leads = await getAllLeads(req.query);
    res.status(200).json({
      success: true,
      data: leads,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to fetch leads.",
    });
  }
});

//update-lead

const updateLead = async (id, data) => {
  try {
    const { name, source, salesAgent, status, tags, timeToClose, priority } =
      data;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw { status: 400, message: "Invalid Lead ID format." };
    }

    const validSources = [
      "Website",
      "Referral",
      "Cold Call",
      "Advertisement",
      "Email",
      "Other",
    ];
    const validStatus = [
      "New",
      "Contacted",
      "Qualified",
      "Proposal Sent",
      "Closed",
    ];

    const validPriorities = ["High", "Medium", "Low"];

    const updateFields = {};

    if (name !== undefined) {
      if (name.trim() === "") {
        throw { status: 400, message: "Name cannot be empty." };
      }
      updateFields.name = name.trim();
    }

    if (source !== undefined) {
      if (!validSources.includes(source)) {
        throw {
          status: 400,
          message: `Invalid source. Must be one of: ${validSources.join(", ")}`,
        };
      }
      updateFields.source = source;
    }

    if (salesAgent !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(salesAgent)) {
        throw { status: 400, message: "Invalid Sales Agent ID format." };
      }
      updateFields.salesAgent = salesAgent;
    }

    if (status !== undefined) {
      if (!validStatus.includes(status)) {
        throw {
          status: 400,
          message: `Invalid status. Must be one of: ${validStatus.join(", ")}`,
        };
      }
      updateFields.status = status;
    }

    if (priority !== undefined) {
      if (!validPriorities.includes(priority)) {
        throw {
          status: 400,
          message: `Invalid priority. Must be one of: ${validPriorities.join(
            ", "
          )}`,
        };
      }
      updateFields.priority = priority;
    }

    if (tags !== undefined) {
      if (!Array.isArray(tags)) {
        throw { status: 400, message: "Tags must be an array of strings." };
      }
      updateFields.tags = tags;
    }

    if (timeToClose !== undefined) {
      if (typeof timeToClose !== "number" || timeToClose <= 0) {
        throw {
          status: 400,
          message: "timeToClose must be a positive number.",
        };
      }
      updateFields.timeToClose = timeToClose;
    }

    if (updateFields.salesAgent) {
      const agentExists = await Agent.findById(updateFields.salesAgent);
      if (!agentExists) {
        throw { status: 404, message: "Sales Agent not found." };
      }
    }

    if (Object.keys(updateFields).length === 0) {
      throw { status: 400, message: "No valid fields provided for update." };
    }

    const updatedLead = await Lead.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    }).populate("salesAgent", "name email");

    if (!updatedLead) {
      throw { status: 404, message: `Lead with ID '${id}' not found.` };
    }

    return updatedLead;
  } catch (error) {
    throw error;
  }
};

app.post("/leads/:id", async (req, res) => {
  try {
    const updatedLead = await updateLead(req.params.id, req.body);

    res.status(200).json(updatedLead);
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to update lead.",
    });
  }
});

//Delete Lead

const deleteLead = async (id) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw { status: 400, message: "Invalid Lead ID format." };
    }

    const deletedLead = await Lead.findByIdAndDelete(id);

    if (!deletedLead) {
      throw { status: 404, message: `Lead with ID '${id}' not found.` };
    }

    return { message: "Lead deleted successfully.", data: deletedLead };
  } catch (error) {
    throw error;
  }
};

app.delete("/leads/:id", async (req, res) => {
  try {
    const result = await deleteLead(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to delete lead.",
    });
  }
});

//Get Lead By Id

const getLeadById = async (id) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw { status: 400, message: "Invalid Lead ID format." };
    }

    const lead = await Lead.findById(id).populate("salesAgent", "name email");

    if (!lead) {
      throw { status: 404, message: `Lead with ID '${id}' not found.` };
    }

    return lead;
  } catch (error) {
    throw error;
  }
};

app.get("/leads/:id", async (req, res) => {
  try {
    const lead = await getLeadById(req.params.id);
    res.status(200).json({
      success: true,
      data: lead,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to fetch lead details.",
    });
  }
});

//Get All leads by Agent Id

const getLeadsByAgent = async (agentId, filters) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(agentId)) {
      throw { status: 400, message: "Invalid Agent ID format." };
    }

    const { status, source, priority, sort } = filters;
    const query = { salesAgent: agentId };

    const validStatus = [
      "New",
      "Contacted",
      "Qualified",
      "Proposal Sent",
      "Closed",
    ];
    if (status) {
      if (!validStatus.includes(status)) {
        throw {
          status: 400,
          message: `Invalid status. Must be one of: ${validStatus.join(", ")}`,
        };
      }
      query.status = status;
    }

    const validSources = [
      "Website",
      "Referral",
      "Cold Call",
      "Advertisement",
      "Email",
      "Other",
    ];
    if (source) {
      if (!validSources.includes(source)) {
        throw {
          status: 400,
          message: `Invalid source. Must be one of: ${validSources.join(", ")}`,
        };
      }
      query.source = source;
    }

    const validPriorities = ["High", "Medium", "Low"];
    if (priority) {
      if (!validPriorities.includes(priority)) {
        throw {
          status: 400,
          message: `Invalid priority. Must be one of: ${validPriorities.join(
            ", "
          )}`,
        };
      }
      query.priority = priority;
    }

    let sortOption = {};
    const validSort = ["High", "Low"];
    if (sort) {
      if (!validSort.includes(sort)) {
        throw {
          status: 400,
          message: `Invalid Sort. Must be one of: ${validSort.join(", ")}`,
        };
      }

      sortOption = sort === "Low" ? { timeToClose: 1 } : { timeToClose: -1 };
    }

    const leads = await Lead.find(query)
      .populate("salesAgent", "name email")
      .sort(sortOption);

    if (leads.length === 0) {
      return {
        status: 404,
        success: false,
        message:
          filters && Object.keys(filters).length > 0
            ? "Filter applied — no leads found for this agent."
            : "No leads assigned to this agent yet.",
        data: [],
      };
    }

    return leads;
  } catch (error) {
    throw error;
  }
};

app.get("/agents/leads/:id", async (req, res) => {
  try {
    const leads = await getLeadsByAgent(req.params.id, req.query);

    res.status(200).json({
      success: true,
      data: leads,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to fetch leads for this agent.",
    });
  }
});

//Add Comment

const addCommentToLead = async (leadId, commentText, author) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(leadId)) {
      throw { status: 400, message: "Invalid Lead ID format." };
    }

    if (!mongoose.Types.ObjectId.isValid(author)) {
      throw { status: 400, message: "Invalid Author ID format." };
    }

    const authorId = await Agent.findById(author);

    if (!authorId) {
      throw { status: 404, message: `Author with ID '${author}' not found.` };
    }

    const lead = await Lead.findById(leadId);
    if (!lead) {
      throw { status: 404, message: `Lead with ID '${leadId}' not found.` };
    }

    if (!commentText) {
      throw { status: 400, message: "Comment text is required" };
    }

    const comment = new Comment({
      lead: leadId,
      commentText,
      author,
    });

    await comment.save();

    return comment;
  } catch (error) {
    throw error;
  }
};

app.post("/comments/:id", async (req, res) => {
  try {
    const { commentText, author } = req.body;
    const comment = await addCommentToLead(req.params.id, commentText, author);

    res.status(201).json({
      success: true,
      message: "Comment added successfully.",
      data: comment,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to add comment.",
    });
  }
});

//Get Comments

const getCommentsByLeadId = async (leadId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(leadId)) {
      throw { status: 400, message: "Invalid Lead ID format." };
    }

    const lead = await Lead.findById(leadId);
    if (!lead) {
      throw { status: 404, message: `Lead with ID '${leadId}' not found.` };
    }

    const comments = await Comment.find({ lead: leadId })
      .populate("author", "name email")
      .sort({ createdAt: -1 });

    if (comments.length === 0) {
      return {
        status: 404,
        success: false,
        message: "No comments found for this lead.",
        data: [],
      };
    }

    return comments;
  } catch (error) {
    throw error;
  }
};

app.get("/leads/comments/:id", async (req, res) => {
  try {
    const comments = await getCommentsByLeadId(req.params.id);

    if (comments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No comments found for this lead.",
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      message: "Comments fetched successfully.",
      data: comments,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to fetch comments for this lead.",
    });
  }
});

//edit comment

const updateCommentById = async (commentId, commentText) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      throw { status: 400, message: "Invalid Comment ID format." };
    }

    if (!commentText) {
      throw {
        status: 400,
        message: "Comment text must be a non-empty string.",
      };
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { commentText },
      { new: true }
    ).populate("author", "name email");

    if (!updatedComment) {
      throw {
        status: 404,
        message: `Comment with ID '${commentId}' not found.`,
      };
    }

    return updatedComment;
  } catch (error) {
    throw error;
  }
};

app.post("/comments/update/:id", async (req, res) => {
  try {
    const { commentText } = req.body;

    const updatedComment = await updateCommentById(req.params.id, commentText);

    res.status(200).json({
      success: true,
      message: "Comment updated successfully.",
      data: updatedComment,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to update comment.",
    });
  }
});

//Delete Comment

const deleteComment = async (id) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw { status: 400, message: "Invalid Comment ID format." };
    }

    const comment = await Comment.findByIdAndDelete(id);

    if (!comment) {
      throw { status: 404, message: `Comment with ID '${id}' not found.` };
    }

    return comment;
  } catch (error) {
    throw error;
  }
};

app.delete("/comments/:id", async (req, res) => {
  try {
    const deletedComment = await deleteComment(req.params.id);

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully.",
      data: deletedComment,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to delete comment.",
    });
  }
});

//Find leads with status 'Closed' and closedAt within the last 7 days

const getLeadsClosedLastWeek = async () => {
  try {
    const today = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 7);

    const leads = await Lead.find({
      status: "Closed",
      closedAt: { $gte: lastWeek, $lte: today },
    }).populate("salesAgent", "name email");

    if (leads.length === 0) {
      throw { status: 404, message: "No leads were closed in the last week." };
    }

    return leads;
  } catch (error) {
    throw error;
  }
};

app.get("/report/last-week", async (req, res) => {
  try {
    const leads = await getLeadsClosedLastWeek();
    res.status(200).json({
      success: true,
      message: "Closed leads from last week fetched successfully.",
      data: leads,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to fetch last week’s closed leads.",
    });
  }
});

//Total Leads in Pipeline

const getTotalLeadsInPipeline = async () => {
  try {
    const totalLeads = await Lead.countDocuments({
      status: { $ne: "Closed" },
    });

    if (totalLeads === 0) {
      return {
        status: 404,
        success: false,
        message: "No active leads found in the pipeline.",
        data: { totalLeadsInPipeline: 0 },
      };
    }

    return { totalLeadsInPipeline: totalLeads };
  } catch (error) {
    throw error;
  }
};

app.get("/report/pipeline", async (req, res) => {
  try {
    const result = await getTotalLeadsInPipeline();

    if (result.status) {
      return res.status(result.status).json({
        success: result.success,
        message: result.message,
        data: result.data,
      });
    }

    res.status(200).json({
      success: true,
      message: "Total leads in pipeline fetched successfully.",
      data: result,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to fetch pipeline data.",
    });
  }
});

const getLeadsBySalesAgent = async () => {
  try {
    const leads = await Lead.aggregate([
      {
        $group: {
          _id: "$salesAgent",
          totalLeads: { $sum: 1 },
          closedLeads: {
            $sum: { $cond: [{ $eq: ["$status", "Closed"] }, 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: "agents",
          localField: "_id",
          foreignField: "_id",
          as: "agentInfo",
        },
      },
      { $unwind: "$agentInfo" },
      {
        $project: {
          _id: 0,
          agentId: "$agentInfo._id",
          agentName: "$agentInfo.name",
          agentEmail: "$agentInfo.email",
          totalLeads: 1,
          closedLeads: 1,
        },
      },
    ]);

    if (leads.length === 0) {
      throw { status: 404, message: "No leads found for any agent." };
    }

    return leads;
  } catch (error) {
    throw error;
  }
};

app.get("/leads-by-agent", async (req, res) => {
  try {
    const data = await getLeadsBySalesAgent();
    res.status(200).json({
      success: true,
      message: "Leads by agent fetched successfully.",
      data,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to fetch leads by agent.",
    });
  }
});

// Get Lead Status Distribution

const getLeadStatusDistribution = async () => {
  try {
    const data = await Lead.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          status: "$_id",
          count: 1,
        },
      },
    ]);

    if (data.length === 0) {
      throw { status: 404, message: "No leads found for status distribution." };
    }

    return data;
  } catch (error) {
    throw error;
  }
};

app.get("/report/status-distribution", async (req, res) => {
  try {
    const data = await getLeadStatusDistribution();
    res.status(200).json({
      success: true,
      message: "Lead status distribution fetched successfully.",
      data,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to fetch lead status distribution.",
    });
  }
});

// Start the server and listen on the specified port
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

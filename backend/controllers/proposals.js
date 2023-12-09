"use strict";

const proposalsService = require("../service/proposals.service");
const Teacher = require("../model/Teacher");

module.exports = {
  /**
   * Get all available proposals
   *
   * @params none
   * @body none
   * @returns { proposals: [ { proposal_id: string, title: string, description: string, supervisor_id: string, ... } ] }
   * @error 401 Unauthorized - if the user isn't a Student
   * @error 500 Internal Server Error - if something went wrong
   */
  getAllProposals: async (req, res) => {
    proposalsService.getAllProposals(req.user.cod_degree)
      .then((result) => {
        res.status(result.status).json({ proposals: result.data });
      })
      .catch((err) => {
        res.status(err.status).json({ error: err.data });
      });
  },

  /**
   * Get a proposal details by its id
   *
   * @params proposal_id
   * @body none
   * @returns { supervisor_name: string, supervisor_surname: string, proposal_id: number, title: string, description: string, ... }
   * @error 400 Bad Request - if the proposal_id is missing
   * @error 404 Not Found - if the proposal_id is not found
   * @error 500 Internal Server Error - if something went wrong
   */
  getProposalById: async (req, res) => {
    let proposal_id = req.params.proposal_id;
    if (!proposal_id) {
      return res.status(400).json({ error: "Missing proposal_id" });
    }

    proposalsService.getProposalById(proposal_id)
      .then((result) => {
        if (result.data.supervisor_id !== req.user.id && req.user instanceof Teacher) {
          return res.status(401).json({ error: "Access to this thesis proposal is unauthorized. Please ensure you have the necessary permissions to view this content." });
        }
        return res.status(result.status).json(result.data);
      })
      .catch((err) => {
        return res.status(err.status).json({ error: err.data });
      });
  },

  /**
   * Insert a new proposal
   *
   * @params none
   * @body {
   *  title : string,
   *  keywords : string[],
   *  type : string,
   *  groups : string[],
   *  description : string,
   *  required_knowledge : string,
   *  notes : string,
   *  expiration_date : string,
   *  level : string,
   *  programmes : string[],
   * }
   * @returns { proposal: { id: number, title: string, ... } }
   * @error 500 Internal Server Error - if something went wrong
   *
   * Refer to the official documentation for more details
   */
  insertProposal: async (req, res) => {
    try {
      const maxIdNum = await proposalsService.getMaxProposalIdNumber();
      const newId = "P" + (maxIdNum + 1).toString().padStart(3, "0");
      const proposal = await proposalsService.insertProposal({
        ...req.body,
        proposal_id: newId,
        groups: [req.user.cod_group],
        supervisor_id: req.user.id
      });
      res.status(201).json({ proposal });
    } catch (err) {
      console.error("[BACKEND-SERVER] Cannot insert new proposal", err);
      res.status(500).json({ error: "Internal server error has occurred" });
    }
  },

  /**
   * Get all active proposals by a professor
   *
   * @params none
   * @body none
   * @returns { proposals: [ { proposal_id: string, title: string, description: string, supervisor_id: string, ... } ] }
   * @error 401 Unauthorized - if the user isn't a Student
   * @error 500 Internal Server Error - if something went wrong
   */
  getAllProfessorProposals: async (req, res) => {
    proposalsService.getAllProfessorProposals(req.user.id)
      .then((result) => {
        res.status(result.status).json({ proposals: result.data });
      })
      .catch((err) => {
        res.status(err.status).json({ error: err.data });
      });
  },

  /**
   * Update an existing proposal
   *
   * @params proposal_id
   * @body {
   *  title : string,
   *  keywords : string[],
   *  type : string,
   *  description : string,
   *  required_knowledge : string,
   *  notes : string,
   *  expiration_date : string,
   *  level : string,
   *  programmes : string[],
   * }
   * @returns { proposal: { id: number, title: string, ... } }
   * @error 404 Not Found - if the proposal does not exist
   * @error 500 Internal Server Error - if something went wrong
   *
   * Refer to the official documentation for more details
   */
  updateProposal: async (req, res) => {
    try {
      const { data: proposal } = await proposalsService.getProposalById(req.params.proposal_id);

      if (proposal.supervisor_id !== req.user?.id) {
        return res.status(403).json({ error: "Not authorized!" });
      }

      const { data } = await proposalsService.updateProposal({ ...req.body });
      res.status(200).json({ proposal: data });
    } catch (err) {
      if (err.status === 404)
        return res.status(404).json({ error: "Proposal not found!" });

      console.error("[BACKEND-SERVER] Cannot update proposal", err);
      res.status(500).json({ error: "Internal server error has occurred" });
    }
  }
};

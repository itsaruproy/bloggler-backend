const Follow = require('../models/Follow')

exports.apiAddFollow = (req, res) => {
    let follow = new Follow(req.params.username, req.apiUser._id)
    follow
        .create()
        .then(() => {
            res.json(true)
        })
        .catch(errors => {
            res.json(false)
        })
}

exports.apiRemoveFollow = (req, res) => {
    let follow = new Follow(req.params.username, req.apiUser._id)
    follow
        .delete()
        .then(() => {
            res.json(true)
        })
        .catch(errors => {
            res.json(false)
        })
}

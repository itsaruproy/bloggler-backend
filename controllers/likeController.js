const Like = require('../models/Like')

exports.apiAddLike = (req, res) => {
    const postId = req.params.id
    const userId = req.apiUser._id

    Like.addLike(postId, userId)
        .then(() => {
            res.json('Like added successfully')
        })
        .catch(e => {
            res.status(500).json('Failed to add like')
        })
}

exports.apiRemoveLike = (req, res) => {
    const postId = req.params.id
    const userId = req.apiUser._id

    Like.removeLike(postId, userId)
        .then(() => {
            res.json('Like removed successfully')
        })
        .catch(e => {
            res.status(500).json('Failed to remove like')
        })
}

exports.apiGetLikesForPost = (req, res) => {
    const postId = req.params.id

    Like.getLikesForPost(postId)
        .then(likes => {
            res.json(likes)
        })
        .catch(e => {
            res.status(500).json('Failed to fetch likes for the post')
        })
}

exports.apiGetLikeCountForPost = (req, res) => {
    const postId = req.params.id

    Like.countLikes(postId)
        .then(likeCount => {
            res.json({ likeCount })
        })
        .catch(e => {
            res.status(500).json('Failed to fetch like count for the post')
        })
}
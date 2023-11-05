const likesCollection = require('../db').db().collection('likes')
const ObjectID = require('mongodb').ObjectID

class Like {
    constructor(postId, userId) {
        this.postId = postId
        this.userId = userId
    }

    static addLike(postId, userId) {
        return new Promise(async (resolve, reject) => {
            try {
                await likesCollection.insertOne({
                    postId: new ObjectID(postId),
                    userId: new ObjectID(userId),
                    createdAt: new Date(),
                })
                resolve()
            } catch (e) {
                reject(e)
            }
        })
    }

    static removeLike(postId, userId) {
        return new Promise(async (resolve, reject) => {
            try {
                await likesCollection.deleteOne({
                    postId: new ObjectID(postId),
                    userId: new ObjectID(userId),
                })
                resolve()
            } catch (e) {
                reject(e)
            }
        })
    }

    static getLikesForPost(postId) {
        return new Promise(async (resolve, reject) => {
            try {
                const likes = await likesCollection
                    .find({ postId: new ObjectID(postId) })
                    .toArray()
                resolve(likes)
            } catch (e) {
                reject(e)
            }
        })
    }
}

module.exports = Like

const postsCollection = require('../db').db().collection('posts')
const followsCollection = require('../db').db().collection('follows')
const ObjectID = require('mongodb').ObjectID
const User = require('./User')
const sanitizeHTML = require('sanitize-html')

postsCollection.createIndex({ title: 'text', body: 'text' })

class Post {
    constructor(data, userid, requestedPostId) {
        this.data = data
        this.errors = []
        this.userid = userid
        this.requestedPostId = requestedPostId
    }

    cleanUp = () => {
        if (typeof this.data.title != 'string') {
            this.data.title = ''
        }
        if (typeof this.data.body != 'string') {
            this.data.body = ''
        }

        // get rid of any bogus properties
        this.data = {
            title: sanitizeHTML(this.data.title.trim(), {
                allowedTags: [],
                allowedAttributes: {},
            }),
            body: sanitizeHTML(this.data.body.trim(), {
                allowedTags: [],
                allowedAttributes: {},
            }),
            createdDate: new Date(),
            author: ObjectID(this.userid),
        }
    }

    validate = () => {
        if (this.data.title == '') {
            this.errors.push('You must provide a title.')
        }
        if (this.data.body == '') {
            this.errors.push('You must provide post content.')
        }
    }

    create = () => {
        return new Promise((resolve, reject) => {
            this.cleanUp()
            this.validate()
            if (!this.errors.length) {
                // save post into database
                postsCollection
                    .insertOne(this.data)
                    .then(info => {
                        resolve(info.ops[0]._id)
                    })
                    .catch(e => {
                        this.errors.push('Please try again later.')
                        reject(this.errors)
                    })
            } else {
                reject(this.errors)
            }
        })
    }

    update = () => {
        return new Promise(async (resolve, reject) => {
            try {
                let post = await Post.findSingleById(
                    this.requestedPostId,
                    this.userid
                )
                if (post.isVisitorOwner) {
                    // actually update the db
                    let status = await this.actuallyUpdate()
                    resolve(status)
                } else {
                    reject()
                }
            } catch (e) {
                reject()
            }
        })
    }

    actuallyUpdate = () => {
        return new Promise(async (resolve, reject) => {
            this.cleanUp()
            this.validate()
            if (!this.errors.length) {
                await postsCollection.findOneAndUpdate(
                    { _id: new ObjectID(this.requestedPostId) },
                    { $set: { title: this.data.title, body: this.data.body } }
                )
                resolve('success')
            } else {
                resolve('failure')
            }
        })
    }

    static reusablePostQuery = (
        uniqueOperations,
        visitorId,
        finalOperations = []
    ) => {
        return new Promise(async function (resolve, reject) {
            let aggOperations = uniqueOperations
                .concat([
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'author',
                            foreignField: '_id',
                            as: 'authorDocument',
                        },
                    },
                    {
                        $project: {
                            title: 1,
                            body: 1,
                            createdDate: 1,
                            authorId: '$author',
                            author: { $arrayElemAt: ['$authorDocument', 0] },
                        },
                    },
                ])
                .concat(finalOperations)

            let posts = await postsCollection.aggregate(aggOperations).toArray()

            // clean up author property in each post object
            posts = posts.map(function (post) {
                post.isVisitorOwner = post.authorId.equals(visitorId)
                post.authorId = undefined

                post.author = {
                    username: post.author.username,
                    avatar: new User(post.author, true).avatar,
                }

                return post
            })

            resolve(posts)
        })
    }

    static findSingleById = (id, visitorId) => {
        return new Promise(async function (resolve, reject) {
            if (typeof id != 'string' || !ObjectID.isValid(id)) {
                reject()
                return
            }

            let posts = await Post.reusablePostQuery(
                [{ $match: { _id: new ObjectID(id) } }],
                visitorId
            )

            if (posts.length) {
                resolve(posts[0])
            } else {
                reject()
            }
        })
    }

    static findByAuthorId = authorId => {
        return Post.reusablePostQuery([
            { $match: { author: authorId } },
            { $sort: { createdDate: -1 } },
        ])
    }

    static delete = (postIdToDelete, currentUserId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let post = await Post.findSingleById(
                    postIdToDelete,
                    currentUserId
                )
                if (post.isVisitorOwner) {
                    await postsCollection.deleteOne({
                        _id: new ObjectID(postIdToDelete),
                    })
                    resolve()
                } else {
                    reject()
                }
            } catch (e) {
                reject()
            }
        })
    }

    static search = searchTerm => {
        return new Promise(async (resolve, reject) => {
            if (typeof searchTerm == 'string') {
                let posts = await Post.reusablePostQuery(
                    [{ $match: { $text: { $search: searchTerm } } }],
                    undefined,
                    [{ $sort: { score: { $meta: 'textScore' } } }]
                )
                resolve(posts)
            } else {
                reject()
            }
        })
    }

    static countPostsByAuthor = id => {
        return new Promise(async (resolve, reject) => {
            let postCount = await postsCollection.countDocuments({ author: id })
            resolve(postCount)
        })
    }

    static getFeed = async id => {
        // create an array of the user ids that the current user follows
        let followedUsers = await followsCollection
            .find({ authorId: new ObjectID(id) })
            .toArray()
        followedUsers = followedUsers.map(function (followDoc) {
            return followDoc.followedId
        })

        // look for posts where the author is in the above array of followed users
        return Post.reusablePostQuery([
            { $match: { author: { $in: followedUsers } } },
            { $sort: { createdDate: -1 } },
        ])
    }
}

module.exports = Post

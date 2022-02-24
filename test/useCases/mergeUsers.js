const userEntity = require("../../entities/userEntity");
const folderEntity = require("../../entities/folderEntity");
const postEntity = require("../../entities/postEntity");
const mergeUsersFactory = require("../../useCases/mergeUsers");

const mergeUsersUseCaseTest = (
    {
        test,
        validators,
        database,
        objectHelpers,
        RequestError
    }
) => {
    test.describe("Merge users use case Test", () => {
        const mergeUsers = mergeUsersFactory({
            validators,
            database,
            objectHelpers,
            RequestError
        });
        const buildUser = userEntity.buildUserFactory({
            validators,
            database
        });
        const buildFolder = folderEntity.buildFolderFactory({
            validators,
            database
        });
        const buildPost = postEntity.buildPostFactory({
            validators,
            database
        });
        const addUser = async (userData) => {
            const user = buildUser({
                ID: database.generateID({
                    collectionName: userEntity.getCollectionData().name
                }),
                ...userData
            });

            await database.insertEntity({
                collectionData: userEntity.getCollectionData(),
                entityData: user
            });

            return user;
        };
        const addFolderToUser = async (userID) => {
            const ID = database.generateID({
                collectionName: folderEntity.getCollectionData().name
            });
            const folder = buildFolder({
                ID,
                name: "Bob's folder " + ID,
                userID
            });

            await database.insertEntity({
                collectionData: folderEntity.getCollectionData(),
                entityData: folder
            });

            return folder;
        };
        const addPostToUser = async (userID) => {
            const ID = database.generateID({
                collectionName: postEntity.getCollectionData().name
            });
            const post = buildPost({
                ID,
                name: "Bob's post " + ID,
                url: "https://spoofed" + ID + ".url",
                originalData: '{"seoProps":{"pageId":"6999955804216364289' + ID + '","pageType":0,"predictedLanguage":"ru-RU","metaParams":{"title":"@3 постоянно жрёт😹 #рекомендации","keywords":"i_am_doshik,i_am_doshik1,рекомендации,TikTok, ティックトック, tik tok, tick tock, tic tok, tic toc, tictok, тик ток, ticktock","description":"Пользователь i_am_doshik (@i_am_doshik1) создал короткое видео в TikTok (тикток) с песней kostyashwarts. | @3 постоянно жрёт😹 #рекомендации | Я в час ночи:","canonicalHref":"https://www.tiktok.com/@i_am_doshik1/video/6999955804216364289","robotsContent":"index, follow, max-image-preview:large","applicableDevice":"pc, mobile"},"videoObject":{},"jsonldList":[["VideoObject",{}],["BreadcrumbList",{}]]},"$language":"ru-RU","statusCode":0,"statusMsg":"","itemInfo":{"itemStruct":{"id":"6999955804216364289","desc":"@3 постоянно жрёт😹 #рекомендации","createTime":1629804216,"scheduleTime":0,"video":{"id":"6999955804216364289","height":960,"width":540,"duration":9,"ratio":"720p","cover":"https://p16-sign-sg.tiktokcdn.com/obj/tos-alisg-p-0037/919dbd43723943f8b003dd5d134505e0?x-expires=1631383200&x-signature=p1dfLwXOe9%2BXUn856RmFLfNpbFQ%3D","originCover":"https://p16-sign-sg.tiktokcdn.com/obj/tos-alisg-p-0037/041dece906c0429dad165594cc07a9f0_1629804217?x-expires=1631383200&x-signature=fPcXSboei0P0d44zl9V%2BFr6pfQs%3D","dynamicCover":"https://p16-sign-sg.tiktokcdn.com/obj/tos-alisg-p-0037/bd79099ddc104ceb8c341308df0a29e6_1629804218?x-expires=1631383200&x-signature=IjzkpB0dSIarGtzjP1aeDusoBQ4%3D","playAddr":"https://v16-web.tiktok.com/video/tos/alisg/tos-alisg-pve-0037c001/fbeadb01dd394d8b9569bee8b65ae686/?a=1988&br=3796&bt=1898&cd=0%7C0%7C1&ch=0&cr=0&cs=0&cv=1&dr=0&ds=3&er=&expire=1631386449&ft=9wMeRetI4kag3&l=20210911125400010190208021003448FA&lr=tiktok_m&mime_type=video_mp4&net=0&pl=0&policy=3&qs=0&rc=amxqNTY6ZmVnNzMzODczNEApOzY1ZTZnNTtmNzQ6MzY7OmdhMV5vcjRfYWZgLS1kMS1zczEyLWEvLmEwMDEwNV8zNGI6Yw%3D%3D&signature=1653902223e88598151759c62aaff5be&tk=0&vl=&vr=","downloadAddr":"https://v16-web.tiktok.com/video/tos/alisg/tos-alisg-pve-0037c001/fbeadb01dd394d8b9569bee8b65ae686/?a=1988&br=3796&bt=1898&cd=0%7C0%7C1&ch=0&cr=0&cs=0&cv=1&dr=0&ds=3&er=&expire=1631386449&ft=9wMeRetI4kag3&l=20210911125400010190208021003448FA&lr=tiktok_m&mime_type=video_mp4&net=0&pl=0&policy=3&qs=0&rc=amxqNTY6ZmVnNzMzODczNEApOzY1ZTZnNTtmNzQ6MzY7OmdhMV5vcjRfYWZgLS1kMS1zczEyLWEvLmEwMDEwNV8zNGI6Yw%3D%3D&signature=1653902223e88598151759c62aaff5be&tk=0&vl=&vr=","shareCover":["","https://p16-sign-sg.tiktokcdn.com/tos-alisg-p-0037/041dece906c0429dad165594cc07a9f0_1629804217~tplv-tiktok-play.jpeg?x-expires=1631383200&x-signature=XdQBjLTFRGVoZ1FuENmNcgrrVAU%3D","https://p16-sign-sg.tiktokcdn.com/tos-alisg-p-0037/041dece906c0429dad165594cc07a9f0_1629804217~tplv-tiktokx-share-play.jpeg?x-expires=1631383200&x-signature=ZRdUq8Tkk6EjdVY89ThN1KztB24%3D"],"reflowCover":"https://p16-sign-sg.tiktokcdn.com/obj/tos-alisg-p-0037/919dbd43723943f8b003dd5d134505e0?x-expires=1631383200&x-signature=p1dfLwXOe9%2BXUn856RmFLfNpbFQ%3D","bitrate":1943872,"encodedType":"normal","format":"mp4","videoQuality":"normal","encodeUserTag":"","codecType":"h264","definition":"720p"},"author":{"id":"6530595983024215055","shortId":"0","uniqueId":"i_am_doshik1","nickname":"i_am_doshik","avatarLarger":"https://p16-sign-sg.tiktokcdn.com/aweme/1080x1080/tos-alisg-avt-0068/320b5bf6e487ead78e742eedc50efad3.jpeg?x-expires=1631448000&x-signature=SDdekOv9%2BBIxKy%2FA8yDXc2VacTM%3D","avatarMedium":"https://p16-sign-sg.tiktokcdn.com/aweme/720x720/tos-alisg-avt-0068/320b5bf6e487ead78e742eedc50efad3.jpeg?x-expires=1631448000&x-signature=%2BbYEhkphICCSZoNg75UN8bFwvBE%3D","avatarThumb":"https://p16-sign-sg.tiktokcdn.com/aweme/100x100/tos-alisg-avt-0068/320b5bf6e487ead78e742eedc50efad3.jpeg?x-expires=1631448000&x-signature=%2BgitbJAvLQ2AUO9pjCZl0K3w5Hc%3D","signature":"👑Королева Кринжа👑 \\nРеклама: инст @iamdoshik.pr","createTime":1520551666,"verified":true,"secUid":"MS4wLjABAAAA16xNiriBTQCNh3aKUdxlI38LFn3jLwNQs7dUA0O7YluLJcCcdNrlrnOLTXGMc1fd","ftc":false,"relation":0,"openFavorite":false,"commentSetting":0,"duetSetting":0,"stitchSetting":0,"privateAccount":false,"secret":false,"isADVirtual":false,"roomId":""},"music":{"id":"6998924035606547202","title":"kostyashwarts","playUrl":"https://sf16-ies-music-sg.tiktokcdn.com/obj/tiktok-obj/6998924004014738178.mp3","coverLarge":"https://p16-sign-sg.tiktokcdn.com/aweme/1080x1080/tos-alisg-avt-0068/02bd9a0c57210d5af60b7374235169d9.jpeg?x-expires=1631448000&x-signature=b49cwNWLM%2FFVxcjvg4LWKmc%2BoJI%3D","coverMedium":"https://p16-sign-sg.tiktokcdn.com/aweme/720x720/tos-alisg-avt-0068/02bd9a0c57210d5af60b7374235169d9.jpeg?x-expires=1631448000&x-signature=uJhMrEYFUHg8XM5XS8FxiwDhFq4%3D","coverThumb":"https://p16-sign-sg.tiktokcdn.com/aweme/100x100/tos-alisg-avt-0068/02bd9a0c57210d5af60b7374235169d9.jpeg?x-expires=1631448000&x-signature=BSCyxiWDaPWBsimhiOqZVegIhJk%3D","authorName":"Willy","original":true,"duration":9,"album":"","scheduleSearchTime":0},"challenges":[{"id":"49711363","title":"рекомендации","desc":"","profileLarger":"","profileMedium":"","profileThumb":"","coverLarger":"","coverMedium":"","coverThumb":"","isCommerce":false}],"stats":{"diggCount":3400000,"shareCount":53200,"commentCount":44300,"playCount":44200000},"isActivityItem":false,"duetInfo":{"duetFromId":"0"},"warnInfo":[],"originalItem":false,"officalItem":false,"textExtra":[{"awemeId":"","start":20,"end":33,"hashtagId":"49711363","hashtagName":"рекомендации","type":1,"userId":"","isCommerce":false,"userUniqueId":"","secUid":""}],"secret":false,"forFriend":false,"digged":false,"itemCommentStatus":0,"showNotPass":false,"vl1":false,"takeDown":0,"itemMute":false,"effectStickers":[{"name":"Ненасыщенные цвета","ID":"452175"}],"authorStats":{"followerCount":14400000,"followingCount":3069,"heart":797600000,"heartCount":797600000,"videoCount":2432,"diggCount":121900},"privateItem":false,"duetEnabled":true,"stitchEnabled":true,"stickersOnItem":[{"stickerText":["Я в час ночи:"],"stickerType":4}],"isAd":false,"shareEnabled":true,"comments":[],"duetDisplay":0,"stitchDisplay":0,"indexEnabled":true}}}',
                userID
            });

            await database.insertEntity({
                collectionData: postEntity.getCollectionData(),
                entityData: post
            });

            return post;
        };

        const authUserData = {
            name: "BobAuth",
            email: "bobauthsemail@fake.mail",
            status: userEntity.getUserStatuses().STATUS_AUTHORIZED
        };
        const guestUserData = {
            name: "BobGuest",
            email: "bobguestsemail@fake.mail"
        };
        const bannedUserData = {
            name: "BobBanned",
            email: "bobbannedsemail@fake.mail",
            status: userEntity.getUserStatuses().STATUS_BANNED
        };
        const disabledUserData = {
            name: "BobDisabled",
            email: "bobdisabledsemail@fake.mail",
            status: userEntity.getUserStatuses().STATUS_DISABLED
        };

        test.before();

        test.it("should merge guest to authorized user", async () => {
            await database.clearDatabase();
            const authUser = await addUser(authUserData);
            const guestUser = await addUser(guestUserData);
            await addFolderToUser(guestUser.getID());
            await addFolderToUser(guestUser.getID());
            await addPostToUser(guestUser.getID());
            await addPostToUser(guestUser.getID());

            await mergeUsers({
                fromUserID: guestUser.getID(),
                toUserID: authUser.getID()
            });

            const newGuestUserData = await database.findOne({
                collectionData: userEntity.getCollectionData(),
                filter: {
                    ID: guestUser.getID()
                }
            });
            const authUserFolderCount = await database.count({
                collectionData: folderEntity.getCollectionData(),
                filter: {
                    userID: authUser.getID()
                }
            });
            const authUserPostCount = await database.count({
                collectionData: postEntity.getCollectionData(),
                filter: {
                    userID: authUser.getID()
                }
            });

            test.equal(
                (authUserFolderCount[0].count === 2 && authUserPostCount[0].count === 2 && newGuestUserData.status === userEntity.getUserStatuses().STATUS_MERGED),
                true,
                "Did not find correct data"
            );
        });
        test.it("should merge guest to guest", async () => {
            await database.clearDatabase();
            const fromUser = await addUser(guestUserData);
            const toUser = await addUser({
                name: "BobToGuest",
                email: "bobtoguestsemail@fake.mail"
            });
            await addFolderToUser(fromUser.getID());
            await addFolderToUser(fromUser.getID());
            await addPostToUser(fromUser.getID());
            await addPostToUser(fromUser.getID());

            await mergeUsers({
                fromUserID: fromUser.getID(),
                toUserID: toUser.getID()
            });

            const newFromUserUserData = await database.findOne({
                collectionData: userEntity.getCollectionData(),
                filter: {
                    ID: fromUser.getID()
                }
            });
            const toUserFolderCount = await database.count({
                collectionData: folderEntity.getCollectionData(),
                filter: {
                    userID: toUser.getID()
                }
            });
            const toUserPostCount = await database.count({
                collectionData: postEntity.getCollectionData(),
                filter: {
                    userID: toUser.getID()
                }
            });

            test.equal(
                (toUserFolderCount[0].count === 2 && toUserPostCount[0].count === 2 && newFromUserUserData.status === userEntity.getUserStatuses().STATUS_MERGED),
                true,
                "Did not find correct data"
            );
        });
        test.it("should merge auth user to auth user", async () => {
            await database.clearDatabase();
            const fromUser = await addUser(authUserData);
            const toUser = await addUser({
                ...authUserData,
                name: "BobAuthTo",
                email: "bobauthtosemail@fake.mail",
            });
            await addFolderToUser(fromUser.getID());
            await addFolderToUser(fromUser.getID());
            await addPostToUser(fromUser.getID());
            await addPostToUser(fromUser.getID());

            await mergeUsers({
                fromUserID: fromUser.getID(),
                toUserID: toUser.getID()
            });

            const newFromUserUserData = await database.findOne({
                collectionData: userEntity.getCollectionData(),
                filter: {
                    ID: fromUser.getID()
                }
            });
            const toUserFolderCount = await database.count({
                collectionData: folderEntity.getCollectionData(),
                filter: {
                    userID: toUser.getID()
                }
            });
            const toUserPostCount = await database.count({
                collectionData: postEntity.getCollectionData(),
                filter: {
                    userID: toUser.getID()
                }
            });

            test.equal(
                (toUserFolderCount[0].count === 2 && toUserPostCount[0].count === 2 && newFromUserUserData.status === userEntity.getUserStatuses().STATUS_MERGED),
                true,
                "Did not find correct data"
            );
        });

        test.it("should throw an error when trying to merge an already merged user", async () => {
            await database.clearDatabase();
            const authUser = await addUser(authUserData);
            const guestUser = await addUser(guestUserData);

            await mergeUsers({
                fromUserID: guestUser.getID(),
                toUserID: authUser.getID()
            });

            await test.rejects(
                mergeUsers({
                    fromUserID: guestUser.getID(),
                    toUserID: authUser.getID()
                }),
                RequestError,
                "Did not receive the expected error"
            );
        });
        test.it("should throw an error when trying to merge to a disabled user", async () => {
            await database.clearDatabase();
            const disabledUser = await addUser(disabledUserData);
            const guestUser = await addUser(guestUserData);

            await test.rejects(
                mergeUsers({
                    fromUserID: guestUser.getID(),
                    toUserID: disabledUser.getID()
                }),
                RequestError,
                "Did not receive the expected error"
            );
        });
        test.it("should throw an error when trying to merge to a banned user", async () => {
            await database.clearDatabase();
            const bannedUser = await addUser(bannedUserData);
            const guestUser = await addUser(guestUserData);

            await test.rejects(
                mergeUsers({
                    fromUserID: guestUser.getID(),
                    toUserID: bannedUser.getID()
                }),
                RequestError,
                "Did not receive the expected error"
            );
        });

        test.it("should throw an error without a from user ID", async () => {
            await database.clearDatabase();
            const authUser = await addUser(authUserData);

            await test.rejects(
                mergeUsers({
                    toUserID: authUser.getID()
                }),
                RequestError,
                "Did not receive the expected error"
            );
        });
        test.it("should throw an error with a non-existent from user ID", async () => {
            await database.clearDatabase();
            const authUser = await addUser(authUserData);

            await test.rejects(
                mergeUsers({
                    toUserID: authUser.getID(),
                    fromUserID: database.generateID({
                        collectionName: userEntity.getCollectionData().name
                    })
                }),
                RequestError,
                "Did not receive the expected error"
            );
        });

        test.it("should throw an error without a to user ID", async () => {
            await database.clearDatabase();
            const guestUser = await addUser(guestUserData);

            await test.rejects(
                mergeUsers({
                    fromUserID: guestUser.getID()
                }),
                RequestError,
                "Did not receive the expected error"
            );
        });
        test.it("should throw an error with a non-existent to user ID", async () => {
            await database.clearDatabase();
            const guestUser = await addUser(guestUserData);

            await test.rejects(
                mergeUsers({
                    fromUserID: guestUser.getID(),
                    toUserID: database.generateID({
                        collectionName: userEntity.getCollectionData().name
                    })
                }),
                RequestError,
                "Did not receive the expected error"
            );
        });
    });
};

module.exports = mergeUsersUseCaseTest;


module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert(
    'StudentInstances',
    [
      {
        id: 10011,
        github: 'http://github.com/tiraopi1/tiralabra1',
        projectName: 'Tiran labraprojekti',
        userId: 10011,
        courseInstanceId: 10011,
        teacherInstanceId: 10011,
        createdAt: '2018-03-26',
        updatedAt: '2018-03-26'
      },
      {
        id: 10012,
        github: 'http://github.com/tiraopi2/tiralabra2',
        projectName: 'Tiran toinen labraprojekti',
        userId: 10012,
        courseInstanceId: 10011,
        teacherInstanceId: 10011,
        createdAt: '2018-03-26',
        updatedAt: '2018-03-26'
      },
      {
        id: 10021,
        github: 'http://github.com/otmprojekti1',
        projectName: 'OTM projekti',
        userId: 10021,
        courseInstanceId: 10012,
        teacherInstanceId: 10012,
        createdAt: '2018-03-26',
        updatedAt: '2018-03-26'
      },
      {
        id: 10022,
        github: 'http://github.com/otmprojekti1',
        projectName: 'Toinen OTM projekti',
        userId: 10022,
        courseInstanceId: 10012,
        teacherInstanceId: 10012,
        createdAt: '2018-03-26',
        updatedAt: '2018-03-26'
      },
      {
        id: 10031,
        github: 'http://github.com/superprojekti',
        projectName: 'Tira super projekti',
        userId: 10031,
        courseInstanceId: 10011,
        teacherInstanceId: 10001,
        createdAt: '2018-03-26',
        updatedAt: '2018-03-26'
      },
      {
        id: 10032,
        github: 'http://github.com/superprojekti',
        projectName: 'OTM super projekti',
        userId: 10031,
        courseInstanceId: 10012,
        teacherInstanceId: 10002,
        createdAt: '2018-03-26',
        updatedAt: '2018-03-26'
      },
      {
        id: 10033,
        github: 'http://github.com/superprojekti',
        projectName: 'super projekti',
        userId: 10031,
        courseInstanceId: 10013,
        teacherInstanceId: 10003,
        createdAt: '2018-03-26',
        updatedAt: '2018-03-26'
      },
      // random otm studeninstancet alkavat
      {
        id: 30001,
        github: 'https://github.com/conlrice/otm',
        projectName: 'proident voluptate et',
        courseInstanceId: 10012,
        teacherInstanceId: 10101,
        userId: 20001,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30002,
        github: 'https://github.com/bailoconnor/otm',
        projectName: 'sit officia officia',
        courseInstanceId: 10012,
        teacherInstanceId: 10101,
        userId: 20002,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30003,
        github: 'https://github.com/vancpotter/otm',
        projectName: 'aliqua sit ut',
        courseInstanceId: 10012,
        teacherInstanceId: 10101,
        userId: 20003,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30004,
        github: 'https://github.com/deleherring/otm',
        projectName: 'laborum incididunt ullamco',
        courseInstanceId: 10012,
        teacherInstanceId: 10101,
        userId: 20004,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30005,
        github: 'https://github.com/richmelton/otm',
        projectName: 'consectetur sint id',
        courseInstanceId: 10012,
        teacherInstanceId: 10101,
        userId: 20005,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30006,
        github: 'https://github.com/woodhahn/otm',
        projectName: 'ut labore nisi',
        courseInstanceId: 10012,
        teacherInstanceId: 10101,
        userId: 20006,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30007,
        github: 'https://github.com/gilbfranks/otm',
        projectName: 'velit amet fugiat',
        courseInstanceId: 10012,
        teacherInstanceId: 10101,
        userId: 20007,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30008,
        github: 'https://github.com/bonnbarron/otm',
        projectName: 'exercitation deserunt do',
        courseInstanceId: 10012,
        teacherInstanceId: 10101,
        userId: 20008,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30009,
        github: 'https://github.com/austsalinas/otm',
        projectName: 'nostrud consectetur laboris',
        courseInstanceId: 10012,
        teacherInstanceId: 10101,
        userId: 20009,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30010,
        github: 'https://github.com/peckballard/otm',
        projectName: 'reprehenderit excepteur cupidatat',
        courseInstanceId: 10012,
        teacherInstanceId: 10101,
        userId: 20010,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30011,
        github: 'https://github.com/deidsullivan/otm',
        projectName: 'culpa reprehenderit ea',
        courseInstanceId: 10012,
        teacherInstanceId: 10101,
        userId: 20011,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30012,
        github: 'https://github.com/torrcunningham/otm',
        projectName: 'voluptate velit Lorem',
        courseInstanceId: 10012,
        teacherInstanceId: 10101,
        userId: 20012,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30013,
        github: 'https://github.com/gentglenn/otm',
        projectName: 'laborum laboris elit',
        courseInstanceId: 10012,
        teacherInstanceId: 10101,
        userId: 20013,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30014,
        github: 'https://github.com/byerspears/otm',
        projectName: 'cillum occaecat sint',
        courseInstanceId: 10012,
        teacherInstanceId: 10101,
        userId: 20014,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30015,
        github: 'https://github.com/annekaufman/otm',
        projectName: 'tempor laboris dolore',
        courseInstanceId: 10012,
        teacherInstanceId: 10101,
        userId: 20015,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30016,
        github: 'https://github.com/chanholcomb/otm',
        projectName: 'occaecat sunt cillum',
        courseInstanceId: 10012,
        teacherInstanceId: 10101,
        userId: 20016,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30017,
        github: 'https://github.com/bartmason/otm',
        projectName: 'ipsum qui non',
        courseInstanceId: 10012,
        teacherInstanceId: 10101,
        userId: 20017,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30018,
        github: 'https://github.com/eleakennedy/otm',
        projectName: 'adipisicing veniam dolore',
        courseInstanceId: 10012,
        teacherInstanceId: 10101,
        userId: 20018,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30019,
        github: 'https://github.com/baxtmendoza/otm',
        projectName: 'pariatur mollit ex',
        courseInstanceId: 10012,
        teacherInstanceId: 10101,
        userId: 20019,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30020,
        github: 'https://github.com/mavithompson/otm',
        projectName: 'ea amet minim',
        courseInstanceId: 10012,
        teacherInstanceId: 10101,
        userId: 20020,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30021,
        github: 'https://github.com/rutlmontgomery/otm',
        projectName: 'deserunt adipisicing sunt',
        courseInstanceId: 10012,
        teacherInstanceId: 10102,
        userId: 20021,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30022,
        github: 'https://github.com/wintcurry/otm',
        projectName: 'occaecat nostrud enim',
        courseInstanceId: 10012,
        teacherInstanceId: 10102,
        userId: 20022,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30023,
        github: 'https://github.com/casedavis/otm',
        projectName: 'id esse non',
        courseInstanceId: 10012,
        teacherInstanceId: 10102,
        userId: 20023,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30024,
        github: 'https://github.com/lottdeleon/otm',
        projectName: 'fugiat voluptate ipsum',
        courseInstanceId: 10012,
        teacherInstanceId: 10102,
        userId: 20024,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30025,
        github: 'https://github.com/judicrosby/otm',
        projectName: 'deserunt occaecat dolor',
        courseInstanceId: 10012,
        teacherInstanceId: 10102,
        userId: 20025,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30026,
        github: 'https://github.com/merrbonner/otm',
        projectName: 'velit officia deserunt',
        courseInstanceId: 10012,
        teacherInstanceId: 10102,
        userId: 20026,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30027,
        github: 'https://github.com/florweiss/otm',
        projectName: 'duis ad in',
        courseInstanceId: 10012,
        teacherInstanceId: 10102,
        userId: 20027,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30028,
        github: 'https://github.com/lenoferguson/otm',
        projectName: 'commodo mollit consectetur',
        courseInstanceId: 10012,
        teacherInstanceId: 10102,
        userId: 20028,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30029,
        github: 'https://github.com/watkgreer/otm',
        projectName: 'exercitation qui mollit',
        courseInstanceId: 10012,
        teacherInstanceId: 10102,
        userId: 20029,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30030,
        github: 'https://github.com/currbarnes/otm',
        projectName: 'deserunt Lorem qui',
        courseInstanceId: 10012,
        teacherInstanceId: 10102,
        userId: 20030,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30031,
        github: 'https://github.com/welchutchinson/otm',
        projectName: 'nulla esse est',
        courseInstanceId: 10012,
        teacherInstanceId: 10102,
        userId: 20031,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30032,
        github: 'https://github.com/shepgilmore/otm',
        projectName: 'do Lorem eiusmod',
        courseInstanceId: 10012,
        teacherInstanceId: 10102,
        userId: 20032,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30033,
        github: 'https://github.com/lakibranch/otm',
        projectName: 'ipsum excepteur id',
        courseInstanceId: 10012,
        teacherInstanceId: 10102,
        userId: 20033,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30034,
        github: 'https://github.com/everhunt/otm',
        projectName: 'sit qui Lorem',
        courseInstanceId: 10012,
        teacherInstanceId: 10102,
        userId: 20034,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30035,
        github: 'https://github.com/mia pittman/otm',
        projectName: 'incididunt mollit ipsum',
        courseInstanceId: 10012,
        teacherInstanceId: 10102,
        userId: 20035,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30036,
        github: 'https://github.com/roslhartman/otm',
        projectName: 'fugiat consequat est',
        courseInstanceId: 10012,
        teacherInstanceId: 10102,
        userId: 20036,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30037,
        github: 'https://github.com/walshodges/otm',
        projectName: 'eu aute amet',
        courseInstanceId: 10012,
        teacherInstanceId: 10102,
        userId: 20037,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30038,
        github: 'https://github.com/ofelweeks/otm',
        projectName: 'veniam labore labore',
        courseInstanceId: 10012,
        teacherInstanceId: 10102,
        userId: 20038,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30039,
        github: 'https://github.com/buckswanson/otm',
        projectName: 'amet est Lorem',
        courseInstanceId: 10012,
        teacherInstanceId: 10102,
        userId: 20039,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30040,
        github: 'https://github.com/bullmejia/otm',
        projectName: 'voluptate velit officia',
        courseInstanceId: 10012,
        teacherInstanceId: 10102,
        userId: 20040,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30041,
        github: 'https://github.com/josemays/otm',
        projectName: 'sit est minim',
        courseInstanceId: 10012,
        teacherInstanceId: 10103,
        userId: 20041,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30042,
        github: 'https://github.com/rosacooley/otm',
        projectName: 'id incididunt esse',
        courseInstanceId: 10012,
        teacherInstanceId: 10103,
        userId: 20042,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30043,
        github: 'https://github.com/lambbenson/otm',
        projectName: 'amet enim sint',
        courseInstanceId: 10012,
        teacherInstanceId: 10103,
        userId: 20043,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30044,
        github: 'https://github.com/ila torres/otm',
        projectName: 'esse ex magna',
        courseInstanceId: 10012,
        teacherInstanceId: 10103,
        userId: 20044,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30045,
        github: 'https://github.com/whitnewton/otm',
        projectName: 'adipisicing cupidatat est',
        courseInstanceId: 10012,
        teacherInstanceId: 10103,
        userId: 20045,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30046,
        github: 'https://github.com/peteluna/otm',
        projectName: 'officia magna laborum',
        courseInstanceId: 10012,
        teacherInstanceId: 10103,
        userId: 20046,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30047,
        github: 'https://github.com/mamikent/otm',
        projectName: 'deserunt pariatur officia',
        courseInstanceId: 10012,
        teacherInstanceId: 10103,
        userId: 20047,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30048,
        github: 'https://github.com/essireyes/otm',
        projectName: 'ex dolore in',
        courseInstanceId: 10012,
        teacherInstanceId: 10103,
        userId: 20048,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30049,
        github: 'https://github.com/cooknewman/otm',
        projectName: 'qui culpa minim',
        courseInstanceId: 10012,
        teacherInstanceId: 10103,
        userId: 20049,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30050,
        github: 'https://github.com/wrigsloan/otm',
        projectName: 'non eiusmod consequat',
        courseInstanceId: 10012,
        teacherInstanceId: 10103,
        userId: 20050,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30051,
        github: 'https://github.com/adrislater/otm',
        projectName: 'consequat ipsum consectetur',
        courseInstanceId: 10012,
        teacherInstanceId: 10103,
        userId: 20051,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30052,
        github: 'https://github.com/schnpoole/otm',
        projectName: 'sunt sunt ut',
        courseInstanceId: 10012,
        teacherInstanceId: 10103,
        userId: 20052,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30053,
        github: 'https://github.com/tameolsen/otm',
        projectName: 'voluptate irure velit',
        courseInstanceId: 10012,
        teacherInstanceId: 10103,
        userId: 20053,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30054,
        github: 'https://github.com/garcconley/otm',
        projectName: 'ipsum commodo tempor',
        courseInstanceId: 10012,
        teacherInstanceId: 10103,
        userId: 20054,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30055,
        github: 'https://github.com/alishoward/otm',
        projectName: 'occaecat irure irure',
        courseInstanceId: 10012,
        teacherInstanceId: 10103,
        userId: 20055,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30056,
        github: 'https://github.com/contmorin/otm',
        projectName: 'in excepteur excepteur',
        courseInstanceId: 10012,
        teacherInstanceId: 10103,
        userId: 20056,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30057,
        github: 'https://github.com/keisclayton/otm',
        projectName: 'sint elit Lorem',
        courseInstanceId: 10012,
        teacherInstanceId: 10103,
        userId: 20057,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30058,
        github: 'https://github.com/arlemccullough/otm',
        projectName: 'est ad id',
        courseInstanceId: 10012,
        teacherInstanceId: 10103,
        userId: 20058,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30059,
        github: 'https://github.com/margtownsend/otm',
        projectName: 'ea occaecat laborum',
        courseInstanceId: 10012,
        teacherInstanceId: 10103,
        userId: 20059,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30060,
        github: 'https://github.com/bishgarcia/otm',
        projectName: 'adipisicing consequat commodo',
        courseInstanceId: 10012,
        teacherInstanceId: 10103,
        userId: 20060,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30061,
        github: 'https://github.com/juankim/otm',
        projectName: 'ut ex consectetur',
        courseInstanceId: 10012,
        teacherInstanceId: 10104,
        userId: 20061,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30062,
        github: 'https://github.com/chamwong/otm',
        projectName: 'sit proident do',
        courseInstanceId: 10012,
        teacherInstanceId: 10104,
        userId: 20062,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30063,
        github: 'https://github.com/aprimills/otm',
        projectName: 'do Lorem qui',
        courseInstanceId: 10012,
        teacherInstanceId: 10104,
        userId: 20063,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30064,
        github: 'https://github.com/russdaniel/otm',
        projectName: 'elit ea irure',
        courseInstanceId: 10012,
        teacherInstanceId: 10104,
        userId: 20064,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30065,
        github: 'https://github.com/chribuchanan/otm',
        projectName: 'aliqua reprehenderit officia',
        courseInstanceId: 10012,
        teacherInstanceId: 10104,
        userId: 20065,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30066,
        github: 'https://github.com/lethcasey/otm',
        projectName: 'enim id nulla',
        courseInstanceId: 10012,
        teacherInstanceId: 10104,
        userId: 20066,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30067,
        github: 'https://github.com/rojafarley/otm',
        projectName: 'ad ea et',
        courseInstanceId: 10012,
        teacherInstanceId: 10104,
        userId: 20067,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30068,
        github: 'https://github.com/randwalker/otm',
        projectName: 'ipsum aliquip excepteur',
        courseInstanceId: 10012,
        teacherInstanceId: 10104,
        userId: 20068,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30069,
        github: 'https://github.com/brennoel/otm',
        projectName: 'quis ut sunt',
        courseInstanceId: 10012,
        teacherInstanceId: 10104,
        userId: 20069,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30070,
        github: 'https://github.com/joantaylor/otm',
        projectName: 'aute velit pariatur',
        courseInstanceId: 10012,
        teacherInstanceId: 10104,
        userId: 20070,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30071,
        github: 'https://github.com/silvhoover/otm',
        projectName: 'ad incididunt tempor',
        courseInstanceId: 10012,
        teacherInstanceId: 10104,
        userId: 20071,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30072,
        github: 'https://github.com/arlihaney/otm',
        projectName: 'ipsum mollit reprehenderit',
        courseInstanceId: 10012,
        teacherInstanceId: 10104,
        userId: 20072,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30073,
        github: 'https://github.com/michknight/otm',
        projectName: 'deserunt non occaecat',
        courseInstanceId: 10012,
        teacherInstanceId: 10104,
        userId: 20073,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30074,
        github: 'https://github.com/lavoroberts/otm',
        projectName: 'nostrud cupidatat quis',
        courseInstanceId: 10012,
        teacherInstanceId: 10104,
        userId: 20074,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30075,
        github: 'https://github.com/alejharris/otm',
        projectName: 'ut amet mollit',
        courseInstanceId: 10012,
        teacherInstanceId: 10104,
        userId: 20075,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30076,
        github: 'https://github.com/renawheeler/otm',
        projectName: 'incididunt exercitation labore',
        courseInstanceId: 10012,
        teacherInstanceId: 10104,
        userId: 20076,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30077,
        github: 'https://github.com/fultperez/otm',
        projectName: 'irure sunt eiusmod',
        courseInstanceId: 10012,
        teacherInstanceId: 10104,
        userId: 20077,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30078,
        github: 'https://github.com/carohuffman/otm',
        projectName: 'nulla velit sunt',
        courseInstanceId: 10012,
        teacherInstanceId: 10104,
        userId: 20078,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30079,
        github: 'https://github.com/josecharles/otm',
        projectName: 'cupidatat labore elit',
        courseInstanceId: 10012,
        teacherInstanceId: 10104,
        userId: 20079,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30080,
        github: 'https://github.com/figuwells/otm',
        projectName: 'minim qui veniam',
        courseInstanceId: 10012,
        teacherInstanceId: 10104,
        userId: 20080,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30081,
        github: 'https://github.com/kerrstewart/otm',
        projectName: 'ullamco aute nisi',
        courseInstanceId: 10012,
        teacherInstanceId: 10105,
        userId: 20081,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30082,
        github: 'https://github.com/aileengland/otm',
        projectName: 'do enim dolore',
        courseInstanceId: 10012,
        teacherInstanceId: 10105,
        userId: 20082,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30083,
        github: 'https://github.com/hillpruitt/otm',
        projectName: 'eu ut nisi',
        courseInstanceId: 10012,
        teacherInstanceId: 10105,
        userId: 20083,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30084,
        github: 'https://github.com/maricotton/otm',
        projectName: 'consequat minim velit',
        courseInstanceId: 10012,
        teacherInstanceId: 10105,
        userId: 20084,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30085,
        github: 'https://github.com/goldsellers/otm',
        projectName: 'fugiat nulla reprehenderit',
        courseInstanceId: 10012,
        teacherInstanceId: 10105,
        userId: 20085,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30086,
        github: 'https://github.com/warrblake/otm',
        projectName: 'nostrud consequat ipsum',
        courseInstanceId: 10012,
        teacherInstanceId: 10105,
        userId: 20086,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30087,
        github: 'https://github.com/brochudson/otm',
        projectName: 'deserunt velit ad',
        courseInstanceId: 10012,
        teacherInstanceId: 10105,
        userId: 20087,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30088,
        github: 'https://github.com/burkboone/otm',
        projectName: 'deserunt voluptate reprehenderit',
        courseInstanceId: 10012,
        teacherInstanceId: 10105,
        userId: 20088,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30089,
        github: 'https://github.com/vegaespinoza/otm',
        projectName: 'anim ad eu',
        courseInstanceId: 10012,
        teacherInstanceId: 10105,
        userId: 20089,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30090,
        github: 'https://github.com/franmitchell/otm',
        projectName: 'incididunt quis minim',
        courseInstanceId: 10012,
        teacherInstanceId: 10105,
        userId: 20090,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30091,
        github: 'https://github.com/faulyates/otm',
        projectName: 'magna Lorem ipsum',
        courseInstanceId: 10012,
        teacherInstanceId: 10105,
        userId: 20091,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30092,
        github: 'https://github.com/haydcannon/otm',
        projectName: 'consectetur Lorem nisi',
        courseInstanceId: 10012,
        teacherInstanceId: 10105,
        userId: 20092,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30093,
        github: 'https://github.com/kaserutledge/otm',
        projectName: 'dolor eiusmod voluptate',
        courseInstanceId: 10012,
        teacherInstanceId: 10105,
        userId: 20093,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30094,
        github: 'https://github.com/saunfitzpatrick/otm',
        projectName: 'pariatur pariatur Lorem',
        courseInstanceId: 10012,
        teacherInstanceId: 10105,
        userId: 20094,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30095,
        github: 'https://github.com/stephorne/otm',
        projectName: 'veniam ut ut',
        courseInstanceId: 10012,
        teacherInstanceId: 10105,
        userId: 20095,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30096,
        github: 'https://github.com/roxijackson/otm',
        projectName: 'eu ea eu',
        courseInstanceId: 10012,
        teacherInstanceId: 10105,
        userId: 20096,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30097,
        github: 'https://github.com/stacharper/otm',
        projectName: 'veniam eiusmod anim',
        courseInstanceId: 10012,
        teacherInstanceId: 10105,
        userId: 20097,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30098,
        github: 'https://github.com/salischneider/otm',
        projectName: 'enim consectetur sint',
        courseInstanceId: 10012,
        teacherInstanceId: 10105,
        userId: 20098,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30099,
        github: 'https://github.com/dawsmadden/otm',
        projectName: 'ea pariatur occaecat',
        courseInstanceId: 10012,
        teacherInstanceId: 10105,
        userId: 20099,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30100,
        github: 'https://github.com/ettaharmon/otm',
        projectName: 'officia aute ea',
        courseInstanceId: 10012,
        teacherInstanceId: 10105,
        userId: 20100,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30101,
        github: 'https://github.com/barkleonard/otm',
        projectName: 'ipsum sint reprehenderit',
        courseInstanceId: 10012,
        teacherInstanceId: 10106,
        userId: 20101,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30102,
        github: 'https://github.com/cortstevenson/otm',
        projectName: 'nisi sint incididunt',
        courseInstanceId: 10012,
        teacherInstanceId: 10106,
        userId: 20102,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30103,
        github: 'https://github.com/misthartman/otm',
        projectName: 'aliquip eu pariatur',
        courseInstanceId: 10012,
        teacherInstanceId: 10106,
        userId: 20103,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30104,
        github: 'https://github.com/ebonhoover/otm',
        projectName: 'adipisicing sint do',
        courseInstanceId: 10012,
        teacherInstanceId: 10106,
        userId: 20104,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30105,
        github: 'https://github.com/mayebullock/otm',
        projectName: 'anim in officia',
        courseInstanceId: 10012,
        teacherInstanceId: 10106,
        userId: 20105,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30106,
        github: 'https://github.com/littwilder/otm',
        projectName: 'eu commodo aliquip',
        courseInstanceId: 10012,
        teacherInstanceId: 10106,
        userId: 20106,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30107,
        github: 'https://github.com/shercarrillo/otm',
        projectName: 'irure nostrud tempor',
        courseInstanceId: 10012,
        teacherInstanceId: 10106,
        userId: 20107,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30108,
        github: 'https://github.com/penndawson/otm',
        projectName: 'anim sit esse',
        courseInstanceId: 10012,
        teacherInstanceId: 10106,
        userId: 20108,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30109,
        github: 'https://github.com/coratate/otm',
        projectName: 'ipsum ipsum esse',
        courseInstanceId: 10012,
        teacherInstanceId: 10106,
        userId: 20109,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30110,
        github: 'https://github.com/maviperez/otm',
        projectName: 'irure duis eiusmod',
        courseInstanceId: 10012,
        teacherInstanceId: 10106,
        userId: 20110,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30111,
        github: 'https://github.com/pearpadilla/otm',
        projectName: 'amet sint labore',
        courseInstanceId: 10012,
        teacherInstanceId: 10106,
        userId: 20111,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30112,
        github: 'https://github.com/nealcruz/otm',
        projectName: 'adipisicing velit aliqua',
        courseInstanceId: 10012,
        teacherInstanceId: 10106,
        userId: 20112,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30113,
        github: 'https://github.com/emmawiggins/otm',
        projectName: 'cillum deserunt veniam',
        courseInstanceId: 10012,
        teacherInstanceId: 10106,
        userId: 20113,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30114,
        github: 'https://github.com/pratdoyle/otm',
        projectName: 'non nostrud labore',
        courseInstanceId: 10012,
        teacherInstanceId: 10106,
        userId: 20114,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30115,
        github: 'https://github.com/deboburgess/otm',
        projectName: 'consequat commodo aliquip',
        courseInstanceId: 10012,
        teacherInstanceId: 10106,
        userId: 20115,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30116,
        github: 'https://github.com/bettrowe/otm',
        projectName: 'proident nostrud esse',
        courseInstanceId: 10012,
        teacherInstanceId: 10106,
        userId: 20116,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30117,
        github: 'https://github.com/dianblevins/otm',
        projectName: 'incididunt nostrud culpa',
        courseInstanceId: 10012,
        teacherInstanceId: 10106,
        userId: 20117,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30118,
        github: 'https://github.com/domivazquez/otm',
        projectName: 'velit aliquip nisi',
        courseInstanceId: 10012,
        teacherInstanceId: 10106,
        userId: 20118,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30119,
        github: 'https://github.com/bowewagner/otm',
        projectName: 'occaecat et ut',
        courseInstanceId: 10012,
        teacherInstanceId: 10106,
        userId: 20119,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30120,
        github: 'https://github.com/flynrobbins/otm',
        projectName: 'sit excepteur in',
        courseInstanceId: 10012,
        teacherInstanceId: 10106,
        userId: 20120,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30121,
        github: 'https://github.com/eulabarber/otm',
        projectName: 'reprehenderit labore et',
        courseInstanceId: 10012,
        teacherInstanceId: 10107,
        userId: 20121,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30122,
        github: 'https://github.com/irwisalazar/otm',
        projectName: 'eiusmod esse ad',
        courseInstanceId: 10012,
        teacherInstanceId: 10107,
        userId: 20122,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30123,
        github: 'https://github.com/reyecox/otm',
        projectName: 'ad ullamco eu',
        courseInstanceId: 10012,
        teacherInstanceId: 10107,
        userId: 20123,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30124,
        github: 'https://github.com/hillbush/otm',
        projectName: 'id occaecat eu',
        courseInstanceId: 10012,
        teacherInstanceId: 10107,
        userId: 20124,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30125,
        github: 'https://github.com/megashaw/otm',
        projectName: 'cillum nulla aliqua',
        courseInstanceId: 10012,
        teacherInstanceId: 10107,
        userId: 20125,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30126,
        github: 'https://github.com/stewlopez/otm',
        projectName: 'deserunt anim sint',
        courseInstanceId: 10012,
        teacherInstanceId: 10107,
        userId: 20126,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30127,
        github: 'https://github.com/wendhuffman/otm',
        projectName: 'Lorem elit non',
        courseInstanceId: 10012,
        teacherInstanceId: 10107,
        userId: 20127,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30128,
        github: 'https://github.com/ashlhowe/otm',
        projectName: 'non excepteur aliquip',
        courseInstanceId: 10012,
        teacherInstanceId: 10107,
        userId: 20128,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30129,
        github: 'https://github.com/gregsolis/otm',
        projectName: 'irure in et',
        courseInstanceId: 10012,
        teacherInstanceId: 10107,
        userId: 20129,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30130,
        github: 'https://github.com/avergeorge/otm',
        projectName: 'veniam culpa occaecat',
        courseInstanceId: 10012,
        teacherInstanceId: 10107,
        userId: 20130,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30131,
        github: 'https://github.com/parkwells/otm',
        projectName: 'consectetur consequat sit',
        courseInstanceId: 10012,
        teacherInstanceId: 10107,
        userId: 20131,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30132,
        github: 'https://github.com/summjordan/otm',
        projectName: 'veniam mollit in',
        courseInstanceId: 10012,
        teacherInstanceId: 10107,
        userId: 20132,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30133,
        github: 'https://github.com/cobbwoods/otm',
        projectName: 'sit incididunt nulla',
        courseInstanceId: 10012,
        teacherInstanceId: 10107,
        userId: 20133,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30134,
        github: 'https://github.com/rosahooper/otm',
        projectName: 'dolor qui non',
        courseInstanceId: 10012,
        teacherInstanceId: 10107,
        userId: 20134,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30135,
        github: 'https://github.com/paulchristensen/otm',
        projectName: 'sit sunt esse',
        courseInstanceId: 10012,
        teacherInstanceId: 10107,
        userId: 20135,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30136,
        github: 'https://github.com/kenykelly/otm',
        projectName: 'sunt exercitation voluptate',
        courseInstanceId: 10012,
        teacherInstanceId: 10107,
        userId: 20136,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30137,
        github: 'https://github.com/charcole/otm',
        projectName: 'aute officia nulla',
        courseInstanceId: 10012,
        teacherInstanceId: 10107,
        userId: 20137,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30138,
        github: 'https://github.com/bartmueller/otm',
        projectName: 'voluptate sit dolor',
        courseInstanceId: 10012,
        teacherInstanceId: 10107,
        userId: 20138,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30139,
        github: 'https://github.com/hewivinson/otm',
        projectName: 'nulla nostrud laboris',
        courseInstanceId: 10012,
        teacherInstanceId: 10107,
        userId: 20139,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30140,
        github: 'https://github.com/inesnoble/otm',
        projectName: 'deserunt tempor voluptate',
        courseInstanceId: 10012,
        teacherInstanceId: 10107,
        userId: 20140,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30141,
        github: 'https://github.com/kaitarnold/otm',
        projectName: 'id non aliqua',
        courseInstanceId: 10012,
        teacherInstanceId: 10108,
        userId: 20141,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30142,
        github: 'https://github.com/popedouglas/otm',
        projectName: 'consectetur in sunt',
        courseInstanceId: 10012,
        teacherInstanceId: 10108,
        userId: 20142,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30143,
        github: 'https://github.com/jewegill/otm',
        projectName: 'aliqua nulla aute',
        courseInstanceId: 10012,
        teacherInstanceId: 10108,
        userId: 20143,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30144,
        github: 'https://github.com/cookdorsey/otm',
        projectName: 'ipsum nostrud eu',
        courseInstanceId: 10012,
        teacherInstanceId: 10108,
        userId: 20144,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30145,
        github: 'https://github.com/steeramirez/otm',
        projectName: 'magna minim quis',
        courseInstanceId: 10012,
        teacherInstanceId: 10108,
        userId: 20145,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30146,
        github: 'https://github.com/rivesimpson/otm',
        projectName: 'sunt sint pariatur',
        courseInstanceId: 10012,
        teacherInstanceId: 10108,
        userId: 20146,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30147,
        github: 'https://github.com/karimitchell/otm',
        projectName: 'exercitation consequat eiusmod',
        courseInstanceId: 10012,
        teacherInstanceId: 10108,
        userId: 20147,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30148,
        github: 'https://github.com/louejacobs/otm',
        projectName: 'minim aliqua duis',
        courseInstanceId: 10012,
        teacherInstanceId: 10108,
        userId: 20148,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30149,
        github: 'https://github.com/mendeverett/otm',
        projectName: 'enim sint veniam',
        courseInstanceId: 10012,
        teacherInstanceId: 10108,
        userId: 20149,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30150,
        github: 'https://github.com/blacpetty/otm',
        projectName: 'adipisicing aute pariatur',
        courseInstanceId: 10012,
        teacherInstanceId: 10108,
        userId: 20150,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30151,
        github: 'https://github.com/hurlbeard/otm',
        projectName: 'excepteur sunt laborum',
        courseInstanceId: 10012,
        teacherInstanceId: 10108,
        userId: 20151,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30152,
        github: 'https://github.com/amalgolden/otm',
        projectName: 'do aliqua ex',
        courseInstanceId: 10012,
        teacherInstanceId: 10108,
        userId: 20152,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30153,
        github: 'https://github.com/rhodnoel/otm',
        projectName: 'nisi fugiat amet',
        courseInstanceId: 10012,
        teacherInstanceId: 10108,
        userId: 20153,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30154,
        github: 'https://github.com/vickhorn/otm',
        projectName: 'exercitation ex ipsum',
        courseInstanceId: 10012,
        teacherInstanceId: 10108,
        userId: 20154,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30155,
        github: 'https://github.com/albarandall/otm',
        projectName: 'elit amet qui',
        courseInstanceId: 10012,
        teacherInstanceId: 10108,
        userId: 20155,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30156,
        github: 'https://github.com/penndecker/otm',
        projectName: 'anim eiusmod amet',
        courseInstanceId: 10012,
        teacherInstanceId: 10108,
        userId: 20156,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30157,
        github: 'https://github.com/grimcalderon/otm',
        projectName: 'consectetur magna magna',
        courseInstanceId: 10012,
        teacherInstanceId: 10108,
        userId: 20157,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30158,
        github: 'https://github.com/pottle/otm',
        projectName: 'consectetur magna veniam',
        courseInstanceId: 10012,
        teacherInstanceId: 10108,
        userId: 20158,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30159,
        github: 'https://github.com/thorbrennan/otm',
        projectName: 'est incididunt ipsum',
        courseInstanceId: 10012,
        teacherInstanceId: 10108,
        userId: 20159,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30160,
        github: 'https://github.com/davefletcher/otm',
        projectName: 'duis ad eu',
        courseInstanceId: 10012,
        teacherInstanceId: 10108,
        userId: 20160,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30161,
        github: 'https://github.com/kellmeyers/otm',
        projectName: 'quis elit aliquip',
        courseInstanceId: 10012,
        teacherInstanceId: 10109,
        userId: 20161,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30162,
        github: 'https://github.com/patebruce/otm',
        projectName: 'non labore cillum',
        courseInstanceId: 10012,
        teacherInstanceId: 10109,
        userId: 20162,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30163,
        github: 'https://github.com/sophtyler/otm',
        projectName: 'officia ea adipisicing',
        courseInstanceId: 10012,
        teacherInstanceId: 10109,
        userId: 20163,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30164,
        github: 'https://github.com/grifhumphrey/otm',
        projectName: 'reprehenderit minim minim',
        courseInstanceId: 10012,
        teacherInstanceId: 10109,
        userId: 20164,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30165,
        github: 'https://github.com/dixoburns/otm',
        projectName: 'non irure dolore',
        courseInstanceId: 10012,
        teacherInstanceId: 10109,
        userId: 20165,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30166,
        github: 'https://github.com/lenaglenn/otm',
        projectName: 'duis eu eu',
        courseInstanceId: 10012,
        teacherInstanceId: 10109,
        userId: 20166,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30167,
        github: 'https://github.com/clayrobles/otm',
        projectName: 'esse enim ea',
        courseInstanceId: 10012,
        teacherInstanceId: 10109,
        userId: 20167,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30168,
        github: 'https://github.com/wynnbeach/otm',
        projectName: 'ullamco consequat anim',
        courseInstanceId: 10012,
        teacherInstanceId: 10109,
        userId: 20168,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30169,
        github: 'https://github.com/margdale/otm',
        projectName: 'do consequat qui',
        courseInstanceId: 10012,
        teacherInstanceId: 10109,
        userId: 20169,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30170,
        github: 'https://github.com/dorehickman/otm',
        projectName: 'Lorem duis culpa',
        courseInstanceId: 10012,
        teacherInstanceId: 10109,
        userId: 20170,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30171,
        github: 'https://github.com/garnbarr/otm',
        projectName: 'exercitation et laboris',
        courseInstanceId: 10012,
        teacherInstanceId: 10109,
        userId: 20171,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30172,
        github: 'https://github.com/ballmcbride/otm',
        projectName: 'do esse ex',
        courseInstanceId: 10012,
        teacherInstanceId: 10109,
        userId: 20172,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30173,
        github: 'https://github.com/mia deleon/otm',
        projectName: 'magna laborum duis',
        courseInstanceId: 10012,
        teacherInstanceId: 10109,
        userId: 20173,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30174,
        github: 'https://github.com/dawnjefferson/otm',
        projectName: 'veniam est adipisicing',
        courseInstanceId: 10012,
        teacherInstanceId: 10109,
        userId: 20174,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30175,
        github: 'https://github.com/barnjoseph/otm',
        projectName: 'laboris veniam anim',
        courseInstanceId: 10012,
        teacherInstanceId: 10109,
        userId: 20175,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30176,
        github: 'https://github.com/herrpatel/otm',
        projectName: 'consequat qui sit',
        courseInstanceId: 10012,
        teacherInstanceId: 10109,
        userId: 20176,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30177,
        github: 'https://github.com/trudarmstrong/otm',
        projectName: 'eiusmod elit consequat',
        courseInstanceId: 10012,
        teacherInstanceId: 10109,
        userId: 20177,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30178,
        github: 'https://github.com/angeboyd/otm',
        projectName: 'proident pariatur mollit',
        courseInstanceId: 10012,
        teacherInstanceId: 10109,
        userId: 20178,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30179,
        github: 'https://github.com/darlserrano/otm',
        projectName: 'deserunt elit sint',
        courseInstanceId: 10012,
        teacherInstanceId: 10109,
        userId: 20179,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30180,
        github: 'https://github.com/garddonovan/otm',
        projectName: 'ad aliqua culpa',
        courseInstanceId: 10012,
        teacherInstanceId: 10109,
        userId: 20180,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30181,
        github: 'https://github.com/joanhogan/otm',
        projectName: 'elit velit ut',
        courseInstanceId: 10012,
        teacherInstanceId: 10110,
        userId: 20181,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30182,
        github: 'https://github.com/petrduncan/otm',
        projectName: 'voluptate ad ipsum',
        courseInstanceId: 10012,
        teacherInstanceId: 10110,
        userId: 20182,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30183,
        github: 'https://github.com/lenogoff/otm',
        projectName: 'eiusmod anim qui',
        courseInstanceId: 10012,
        teacherInstanceId: 10110,
        userId: 20183,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30184,
        github: 'https://github.com/thomaguirre/otm',
        projectName: 'ex labore proident',
        courseInstanceId: 10012,
        teacherInstanceId: 10110,
        userId: 20184,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30185,
        github: 'https://github.com/combbartlett/otm',
        projectName: 'Lorem ut pariatur',
        courseInstanceId: 10012,
        teacherInstanceId: 10110,
        userId: 20185,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30186,
        github: 'https://github.com/laurdalton/otm',
        projectName: 'nulla ad eiusmod',
        courseInstanceId: 10012,
        teacherInstanceId: 10110,
        userId: 20186,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30187,
        github: 'https://github.com/chrisweeney/otm',
        projectName: 'deserunt incididunt proident',
        courseInstanceId: 10012,
        teacherInstanceId: 10110,
        userId: 20187,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30188,
        github: 'https://github.com/annisparks/otm',
        projectName: 'aliquip aliqua aliquip',
        courseInstanceId: 10012,
        teacherInstanceId: 10110,
        userId: 20188,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30189,
        github: 'https://github.com/nannhebert/otm',
        projectName: 'culpa incididunt commodo',
        courseInstanceId: 10012,
        teacherInstanceId: 10110,
        userId: 20189,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30190,
        github: 'https://github.com/evanthornton/otm',
        projectName: 'non irure ut',
        courseInstanceId: 10012,
        teacherInstanceId: 10110,
        userId: 20190,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30191,
        github: 'https://github.com/wilsclements/otm',
        projectName: 'nulla reprehenderit elit',
        courseInstanceId: 10012,
        teacherInstanceId: 10110,
        userId: 20191,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30192,
        github: 'https://github.com/gonzhoward/otm',
        projectName: 'ex exercitation Lorem',
        courseInstanceId: 10012,
        teacherInstanceId: 10110,
        userId: 20192,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30193,
        github: 'https://github.com/marikaufman/otm',
        projectName: 'esse veniam Lorem',
        courseInstanceId: 10012,
        teacherInstanceId: 10110,
        userId: 20193,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30194,
        github: 'https://github.com/wolfduke/otm',
        projectName: 'sit aliqua ea',
        courseInstanceId: 10012,
        teacherInstanceId: 10110,
        userId: 20194,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30195,
        github: 'https://github.com/ochocrawford/otm',
        projectName: 'sunt exercitation ea',
        courseInstanceId: 10012,
        teacherInstanceId: 10110,
        userId: 20195,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30196,
        github: 'https://github.com/bertdavenport/otm',
        projectName: 'excepteur sint consectetur',
        courseInstanceId: 10012,
        teacherInstanceId: 10110,
        userId: 20196,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30197,
        github: 'https://github.com/juansalinas/otm',
        projectName: 'consectetur reprehenderit nostrud',
        courseInstanceId: 10012,
        teacherInstanceId: 10110,
        userId: 20197,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30198,
        github: 'https://github.com/conrvaldez/otm',
        projectName: 'exercitation veniam exercitation',
        courseInstanceId: 10012,
        teacherInstanceId: 10110,
        userId: 20198,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30199,
        github: 'https://github.com/hatfowen/otm',
        projectName: 'consectetur commodo cillum',
        courseInstanceId: 10012,
        teacherInstanceId: 10110,
        userId: 20199,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      },
      {
        id: 30200,
        github: 'https://github.com/minejones/otm',
        projectName: 'amet aliquip reprehenderit',
        courseInstanceId: 10012,
        teacherInstanceId: 10110,
        userId: 20200,
        createdAt: '1970-01-01',
        updatedAt: '1970-01-01'
      }
      // random otm studeninstancet loppu
    ],
    {}
  ),

  down: (queryInterface, Sequelize) => queryInterface.bulkDelete('StudentInstances', null, {})
}

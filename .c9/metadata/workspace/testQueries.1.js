{"filter":false,"title":"testQueries.1.js","tooltip":"/testQueries.1.js","undoManager":{"mark":70,"position":70,"stack":[[{"group":"doc","deltas":[{"action":"removeLines","range":{"start":{"row":24,"column":0},"end":{"row":94,"column":0}},"nl":"\n","lines":["","var teamSchema = new mongoose.Schema({","    name: String,","    logo: String,","    shtname: String,","    shtcode:String","});","var Team = mongoose.model('Team',teamSchema);","","var leagueSchema = new mongoose.Schema({","    name: String,","    logo: String,","    sponsor: String","});","var League = mongoose.model('League',leagueSchema);","","var eventSchema = new mongoose.Schema({","    name: String,","    league: mongoose.Schema.ObjectId","});","var Event = mongoose.model('Event',eventSchema);","","var roundSchema = new mongoose.Schema({","    name: String,","    roundPosition: Number,","    league: {type: mongoose.Schema.Types.ObjectId, ref: 'League'},","    event: {type: mongoose.Schema.Types.ObjectId, ref: 'Event'},","    closeDate: Date","});","var Round = mongoose.model('Round',roundSchema);","","var playerSchema = new mongoose.Schema({","    name: String,","    currentTeam: {type: mongoose.Schema.Types.ObjectId, ref: 'Team'},","    currentPosition: String","});","var Player = mongoose.model('Player', playerSchema);","","var fixtureSchema = new mongoose.Schema({","    homeTeam: {type: mongoose.Schema.Types.ObjectId, ref: 'Team'},","    awayTeam: {type: mongoose.Schema.Types.ObjectId, ref: 'Team'},","    winner: {type: mongoose.Schema.Types.ObjectId, ref: 'Team'},","    homeScore: Number,","    awayScore: Number,","    scoreDifference: Number,","    homePenaltySO: Number,","    awayPenaltySO: Number,","    homeTeamLeaguePoints: Number,","    awayTeamLeaguePoints: Number,","    round: {type: mongoose.Schema.Types.ObjectId, ref: 'Round'},","    date: Date,","});","var Fixture = mongoose.model('Fixture', fixtureSchema);","","var userSchema = new mongoose.Schema({","    local       : {","        email   : String,","        password: String","    }","});","var User = mongoose.model('User', userSchema);","","var competitionSchema = new mongoose.Schema({","    name: String,","    usersAccepted: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],","    league: {type: mongoose.Schema.Types.ObjectId, ref: 'League'},","    event: {type: mongoose.Schema.Types.ObjectId, ref: 'Event'},","    //scoring: [scoring options]","});","var Competition = mongoose.model('Competition', competitionSchema);"]}]}],[{"group":"doc","deltas":[{"action":"removeText","range":{"start":{"row":22,"column":0},"end":{"row":22,"column":38}},"text":"// This line assumes no authentication"}]}],[{"group":"doc","deltas":[{"action":"removeLines","range":{"start":{"row":22,"column":0},"end":{"row":23,"column":0}},"nl":"\n","lines":[""]}]}],[{"group":"doc","deltas":[{"action":"removeLines","range":{"start":{"row":25,"column":0},"end":{"row":36,"column":0}},"nl":"\n","lines":["/** get some test data"," *  1. get user email OK"," *  2. get any competitions that user is in. OK"," *  3. Once in comp, list all rounds OK"," *  4. in Round list all fixtures OK"," *  5. Think abotu what the selesction screen will look like"," *  6. create some selections."," *  7. get back selections"," *  8. do scoring on goaldiff"," *  9. get score for fixture, round, event for user"," */"]}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":16,"column":0},"end":{"row":17,"column":0}},"text":"\n"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":16,"column":0},"end":{"row":17,"column":0}},"text":"\n"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":17,"column":0},"end":{"row":17,"column":22}},"text":"/** get some test data"},{"action":"insertText","range":{"start":{"row":17,"column":22},"end":{"row":18,"column":0}},"text":"\n"},{"action":"insertLines","range":{"start":{"row":18,"column":0},"end":{"row":28,"column":0}},"lines":[" *  1. get user email OK"," *  2. get any competitions that user is in. OK"," *  3. Once in comp, list all rounds OK"," *  4. in Round list all fixtures OK"," *  5. Think abotu what the selesction screen will look like"," *  6. create some selections."," *  7. get back selections"," *  8. do scoring on goaldiff"," *  9. get score for fixture, round, event for user"," */"]}]}],[{"group":"doc","deltas":[{"action":"removeLines","range":{"start":{"row":28,"column":0},"end":{"row":29,"column":0}},"nl":"\n","lines":[""]}]}],[{"group":"doc","deltas":[{"action":"removeLines","range":{"start":{"row":36,"column":0},"end":{"row":37,"column":0}},"nl":"\n","lines":[""]}]}],[{"group":"doc","deltas":[{"action":"removeLines","range":{"start":{"row":36,"column":0},"end":{"row":37,"column":0}},"nl":"\n","lines":[""]}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":34,"column":35},"end":{"row":35,"column":0}},"text":"\n"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":35,"column":0},"end":{"row":35,"column":1}},"text":"v"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":35,"column":1},"end":{"row":35,"column":2}},"text":"a"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":35,"column":2},"end":{"row":35,"column":3}},"text":"r"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":35,"column":3},"end":{"row":35,"column":4}},"text":" "}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":35,"column":4},"end":{"row":35,"column":5}},"text":"m"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":35,"column":5},"end":{"row":35,"column":6}},"text":"o"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":35,"column":6},"end":{"row":35,"column":7}},"text":"d"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":35,"column":7},"end":{"row":35,"column":8}},"text":"e"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":35,"column":8},"end":{"row":35,"column":9}},"text":"l"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":35,"column":9},"end":{"row":35,"column":10}},"text":"s"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":35,"column":10},"end":{"row":35,"column":11}},"text":"."}]}],[{"group":"doc","deltas":[{"action":"removeText","range":{"start":{"row":35,"column":10},"end":{"row":35,"column":11}},"text":"."}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":35,"column":10},"end":{"row":35,"column":11}},"text":" "}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":35,"column":11},"end":{"row":35,"column":12}},"text":"="}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":35,"column":12},"end":{"row":35,"column":13}},"text":" "}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":35,"column":13},"end":{"row":35,"column":14}},"text":"r"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":35,"column":14},"end":{"row":35,"column":15}},"text":"e"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":35,"column":15},"end":{"row":35,"column":16}},"text":"q"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":35,"column":16},"end":{"row":35,"column":17}},"text":"u"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":35,"column":17},"end":{"row":35,"column":18}},"text":"i"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":35,"column":18},"end":{"row":35,"column":19}},"text":"r"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":35,"column":19},"end":{"row":35,"column":20}},"text":"e"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":35,"column":20},"end":{"row":35,"column":22}},"text":"()"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":35,"column":21},"end":{"row":35,"column":23}},"text":"''"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":35,"column":22},"end":{"row":35,"column":23}},"text":"."}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":35,"column":23},"end":{"row":35,"column":24}},"text":"/"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":35,"column":24},"end":{"row":35,"column":25}},"text":"m"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":35,"column":25},"end":{"row":35,"column":26}},"text":"o"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":35,"column":26},"end":{"row":35,"column":27}},"text":"d"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":35,"column":27},"end":{"row":35,"column":28}},"text":"e"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":35,"column":28},"end":{"row":35,"column":29}},"text":"l"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":35,"column":29},"end":{"row":35,"column":30}},"text":"s"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":43,"column":4},"end":{"row":43,"column":5}},"text":"m"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":43,"column":5},"end":{"row":43,"column":6}},"text":"o"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":43,"column":6},"end":{"row":43,"column":7}},"text":"d"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":43,"column":7},"end":{"row":43,"column":8}},"text":"e"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":43,"column":8},"end":{"row":43,"column":9}},"text":"l"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":43,"column":9},"end":{"row":43,"column":10}},"text":"s"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":43,"column":10},"end":{"row":43,"column":11}},"text":"."}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":50,"column":12},"end":{"row":50,"column":13}},"text":"m"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":50,"column":13},"end":{"row":50,"column":14}},"text":"o"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":50,"column":14},"end":{"row":50,"column":15}},"text":"d"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":50,"column":15},"end":{"row":50,"column":16}},"text":"e"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":50,"column":16},"end":{"row":50,"column":17}},"text":"l"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":50,"column":17},"end":{"row":50,"column":18}},"text":"s"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":50,"column":18},"end":{"row":50,"column":19}},"text":"."}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":57,"column":24},"end":{"row":57,"column":25}},"text":"m"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":57,"column":25},"end":{"row":57,"column":26}},"text":"o"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":57,"column":26},"end":{"row":57,"column":27}},"text":"d"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":57,"column":27},"end":{"row":57,"column":28}},"text":"e"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":57,"column":28},"end":{"row":57,"column":29}},"text":"l"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":57,"column":29},"end":{"row":57,"column":30}},"text":"s"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":57,"column":30},"end":{"row":57,"column":31}},"text":"."}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":64,"column":36},"end":{"row":64,"column":37}},"text":"m"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":64,"column":37},"end":{"row":64,"column":38}},"text":"o"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":64,"column":38},"end":{"row":64,"column":39}},"text":"d"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":64,"column":39},"end":{"row":64,"column":40}},"text":"e"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":64,"column":40},"end":{"row":64,"column":41}},"text":"l"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":64,"column":41},"end":{"row":64,"column":42}},"text":"s"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":64,"column":42},"end":{"row":64,"column":43}},"text":"."}]}]]},"ace":{"folds":[],"scrolltop":415,"scrollleft":0,"selection":{"start":{"row":64,"column":43},"end":{"row":64,"column":43},"isBackwards":false},"options":{"guessTabSize":true,"useWrapMode":false,"wrapToView":true},"firstLineState":{"row":28,"state":"no_regex","mode":"ace/mode/javascript"}},"timestamp":1407315475227,"hash":"857f3c15d02d8b829f4d5266fd327002b81b0d65"}
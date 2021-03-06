// app/routes.js
module.exports = function(app, passport) {

	// =====================================
	// HOME PAGE (with login links) ========
	// =====================================
	app.get('/', function(req, res) {
		console.log("PATH: %s", req.session.postAuthRedirect);	

		res.render('index.ejs', {successMsg: req.flash('successMsg'),
								 dangerMsg: req.flash('dangerMsg'), warningMsg: req.flash('warningMsg')}); // load the index.ejs file
	});

	// =====================================
	// LOGIN ===============================
	// =====================================
	// show the login form
	app.get('/login', function(req, res) {
		// render the page and pass in any flash data if it exists
		res.render('login.ejs', { message: req.flash('loginMessage') }); 
	});

    // process the login form (format taken from https://stackoverflow.com/questions/9885711/custom-returnurl-on-node-js-passports-google-strategy to allow custom redirects)
	app.post('/login', function(req,res,next){
		passport.authenticate('local-login', function(err, user, info){
			var redirectUrl = '/competitions'; // set a defulat success redirect url.
			
			if (err){return next(err)}
			if(!user) {return res.redirect('/')}
			
			// if we have storeed a url to redirect to use that instead of default
			if (req.session.postAuthRedirect) {
				redirectUrl = req.session.postAuthRedirect;
				req.session.postAuthRedirect = null;
			}
			req.logIn(user, function(err){
				if (err){return next(err)}
			});
			res.redirect(redirectUrl);
		})(req, res, next);
	});

/**	app.post('/login', passport.authenticate('local-login', {
		successRedirect : '/competitions', // redirect to the compeitions list
		failureRedirect : '/', // redirect back to the index/login page if there is an error
		failureFlash : true // allow flash messages
	}));
**/


	// =====================================
	// SIGNUP ==============================
	// =====================================
	// show the signup form
	app.get('/signup', function(req, res) {

		// render the page and pass in any flash data if it exists
		res.render('signup.ejs', { message: req.flash('signupMessage') });
	});

/**
 * REMOVE SIGN UP
	// process the signup form
    // process the signup form
	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/profile', // redirect to the secure profile section
		failureRedirect : '/signup', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));
**/

	// =====================================
	// PROFILE SECTION =====================
	// =====================================
	// we will want this protected so you have to be logged in to visit
	// we will use route middleware to verify this (the isLoggedIn function)
	app.get('/profile', isLoggedIn, function(req, res) {
		//console.log('%s',req.user);
		res.render('profile.ejs', {
			user : req.user // get the user out of session and pass to template
		});
	});

	// =====================================
	// LOGOUT ==============================
	// =====================================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});
	
	// =====================================
	// COMPETITIONS ========================
	// =====================================
	// shows the competitions the user is registered with
	app.get('/competitions', isLoggedIn, function(req, res) {
		var Competition = require('../app/models/competition');
		var League = require('../app/models/league');
		var Event = require('../app/models/event');

		Competition.find({usersAccepted:req.user.id}).populate('event league').exec( function(err,comps) {
			if (err) {console.log('ERR: compeitions page on comps')}
			else{
				Competition.userRanking(req.user.id, function(err, rank){
					if (err) {console.log('ERR: compeitions page on rank')}
					else {
						comps.sort(function compare(a,b) {if (a.event.lastFixtureDate > b.event.lastFixtureDate){return -1};if (a.event.lastFixtureDate < b.event.lastFixtureDate){return 1};return 0;});
						//console.log(rank);
						//console.log(createCompetitionLookup(rank));
						res.render('competitions.ejs', {
							user : req.user, // get the user out of session and pass to template
							competitions: comps,
							rankings: createCompetitionLookup(rank),
							successMsg: req.flash('successMsg'),
							dangerMsg: req.flash('dangerMsg'),
							warningMsg: req.flash('warningMsg')
							});
					}
				});
			}
		});
	});
	
	// =====================================
	// ROUNDS ==============================
	// =====================================
	// Gets the round details for the competition
	app.get('/rounds', isLoggedIn, function(req, res) {
		var Competition = require('../app/models/competition');
		var Round = require('../app/models/round');
		var Point = require('../app/models/point');
		var User = require('../app/models/user');		
		var FixturePick =require('../app/models/fixturePick');
		var async = require('async');
		
		Competition.findById(req.param('competition'), function (err,comp){
		if (err) {console.log('ERR: rounds page on comps')}
			else{
						Round.find({event:comp.event}).sort('roundPosition').exec(function(err,rounds){
							if (err){console.log('ERR: round page on rounds')}
							else {
								Point.find({competition:comp.id, type:'event'}).sort('ranking').populate('user').lean().exec(function(err,rank){
									if (err){console.log('ERR: round page on rank')}
									else{
										Point.find({competition:comp.id, type:'round', user:req.user.id}).exec(function(err,points){
											if (err){console.log('ERR: round page on points')}
											else{
												User.findById(req.user.id).exec(function (err, user){
													if (err){console.log('ERROR:', err)}
													else {
														async.waterfall([
															// get data ready for rendering
															function (renderData_cbk){
																// WARNING YOU HAVE TO USE MONGO OBJECT WHEN USING MATCH.
																FixturePick.aggregate([
														            {$match:{ user:user._id, competition:comp._id }},
																	{$group: {_id:"$round", count:{$sum:1}} }
																], function(err, result){
																	if(err){console.log('ERROR: %s',err)}
																	else{
																		//console.log("got the result:");
																		renderData_cbk(null, createFixturePicksByRoundLookup(result));
																	}
																});
															}, 
															
														],
														// once all data gathered and passed forward it is rendered.
															function (err,pickLookupByRound){
																if (err){console.log("ERROR:%s",err)}
																res.render('rounds.ejs', {
																	user : req.user, // get the user out of session and pass to template
																	competition: comp,
																	points: createRoundLookup(points),
																	rounds: roundsStatusDisplay(rounds,createRoundLookup(points),pickLookupByRound),
																	rankings:rank,
																	pointsHistoryData: JSON.stringify(createCjsDataPointHistory(rank,req.user.id)),
																	pointsHistoryToolTip: "<%= datasetLabel%>:<%= value %>",
																	successMsg: req.flash('successMsg'),
																	dangerMsg: req.flash('dangerMsg'),
																	warningMsg: req.flash('warningMsg')
																});
															}

														);								
													}
												});
												
											}
										});
									}
								});
							}
						});
							
					
				
			}
		});
	});

	// =====================================
	// FIXTURES ============================
	// =====================================
	// Gets the fixture details for the competition
	app.get('/fixtures', isLoggedIn, function(req, res) {
		var Point = require('../app/models/point');
		var Fixture = require('../app/models/fixture');
		var Round = require('../app/models/round');
		var Competition = require('../app/models/competition');
		var FixturePick =require('../app/models/fixturePick');
		var Team = require('../app/models/team'); //needed for the populate for fixtures.
		var User = require('../app/models/user');		//needed for the populate for users
		//console.log('FIXTURES: PARAM REQ:',req.param);
		
		Fixture.find({round:req.param('round'), type:'match'}).populate('homeTeam awayTeam').sort('date').lean().exec(function (err,fixtures){
		if (err) {console.log('ERR: fixtures page on fixtures')}
			else{
				FixturePick.find({competition:req.param('competition'), round:req.param('round'), user:req.user.id}).exec(function(err,picks){
					//console.log('FIXTURES LIST\n');
					//console.log(fixtures);
					Competition.findById(req.param('competition')).exec(function(err,comp){
						//console.log('FIXTURES: comp:%s',comp)
						Round.findById(req.param('round')).exec(function(err, round){
							Point.find({competition:comp.id, type:'round',round:round.id}).sort('ranking').populate('user').exec(function(err,rank){
								Point.find({competition:comp.id, type:'fixture', user:req.user.id, round:round.id}).exec(function(err,points){
									res.render('fixtures.ejs', {
										user : req.user, // get the user out of session and pass to template
										fixtures: fixtures,
										picks: createFixtureLookup(picks),
										competition: comp,
										round: round,
										rankings: rank,
										points: createFixtureLookup(points),
										successMsg: req.flash('successMsg'),
										dangerMsg: req.flash('dangerMsg'),
										warningMsg: req.flash('warningMsg')
									});
								});
							})
						});
					});
							
							
				});
			}
		});
	});
	
	app.get('/fixturePick', isLoggedIn, function(req, res) {
		var Fixture = require('../app/models/fixture');
		var FixturePick =require('../app/models/fixturePick');
		var Team = require('../app/models/team'); //needed for the populate for fixtures.
		var Round =require('../app/models/round');
		var Competition =require('../app/models/competition');
		var Point =require('../app/models/point');
		var Statistic =require('../app/models/statistic');

		Fixture.findById(req.param('fixture')).exec(function (err,fixture){
		if (err) {console.log('ERR: fixturePick page on fixtures')}
			else{
				//console.log('FIXTURE:%s',fixture);
				Competition.findById(req.param('competition')).exec(function(err, comp){
					if (err) {console.log('ERR: fixtures pick page on COMP lookup')}
					else{
						Team.find({league:comp.league}).exec(function (err,teams){
						if (err) {console.log('ERR: fixtures page on teams')}
							else{				
								Team.findOne({name:'Draw', league:comp.league}).exec(function (err,draw){
									if (err) {console.log('ERR: fixtures page on fixtures')}
									else{				
										FixturePick.findOne({competition:req.param('competition'), fixture:req.param('fixture'), user:req.user.id}).exec(function(err,pick){
											if (err) {console.log('ERR: fixtures page on picks')}
											else {
												Round.findById(fixture.round, function (err,round){
													if (err) {console.log('ERR: fixtures page on picks')}
													else {
														Point.findOne({user:req.user.id, competition:comp.id, fixture:fixture.id}).exec(function (err, points){
																if (err) {console.log('ERR: fixtures pick page on COMP lookup')}
																else {
																	Statistic.findOne({fixture:fixture._id, competition:comp._id}).exec(function(err, stats){
																		if (err){console.log('error in getting the stats for the fixture')}
																		else {
																			if (stats === null){
																				stats = {data: undefined};
																			}
																			res.render('fixturePick.ejs', {
																				user : req.user, // get the user out of session and pass to template
																				fixture: fixture,
																				pick: pick,
																				teams: createIdLookup(teams),
																				draw: draw,
																				round: round,
																				competition: comp,
																				points: points,
																				stats: stats.data,
																			    statsMultiToolTip: "<%= datasetLabel %> : <%= value %>",																				
																				successMsg: req.flash('successMsg'),
																				dangerMsg: req.flash('dangerMsg'),
																				warningMsg: req.flash('warningMsg')
																			});
																		}
																	});
																	
																}
															});
													}
												});
											}
										});
									}
								});
							}				
						});
					}			
				});

			}
		});

	});

	app.post('/submitPick', isLoggedIn, function(req, res) {
		/**
		 * submitPick tries to save parts of the pick one at a time. Depending on timing this may mean that
		 * part of a pick is saved if another part fails. However this will still trigger a warning to the user that
		 * the pick is incomplete.
		 * 
		 **/
		var FixturePick =require('../app/models/fixturePick');
		var Competition =require('../app/models/competition');
		var async = require('async');
	
		async.waterfall([
			function (callback_up){
				var pickData = {};
				//console.log('Getting competition details');
				Competition.findById(req.body.competitionId).exec(function (findError, competition){
					if (findError){
						callback_up('Pick not saved: Competition not found');
					}
					else {
						//console.log('creating Pick data');
						
						// New async internal series starts here
						async.eachSeries(competition.scoring, 
							function (option, callback_so){
								if (option.type=='winner'){
									if (req.body.winner === undefined){
										//console.log('NO WINNER');
										callback_so('Pick not recorded, no winner selected.');
									}
									else{
										//console.log('FOUND WINNER');
										pickData.winner = req.body.winner;
										callback_so(null); // no need to go further
									}
								}
								
								if (option.type == 'exactResult'){
									if (req.body.homeScore === undefined || req.body.awayScore === undefined){
										callback_so('Pick not recorded, home and/or away scores not selected.');
									}
									else{
										//console.log('FOUND EXACT RESULT');
										pickData.homeScore = req.body.homeScore;
										pickData.awayScore = req.body.awayScore;
										callback_so(null); // no need to go further
									}
								}
								if (option.type== 'scoreDifference'){
									if(req.body.scoreDifference===undefined){
										callback_so('Pick not recorded, score difference not selected.',null);
									}
									else{
										//console.log('FOUND SCORE DIFFERENCE');
										pickData.scoreDifference = req.body.scoreDifference;
										callback_so(null); // no need to go further
									}
								}
							},function (err){
								if (err){callback_up('Pick failed validation');}
								else{callback_up(null, pickData)}
							}
						);
					}
				});
			},
			function (pickData, callback_db){
				//console.log('adding pick data to database, PICKDATA: %s',pickData.winner);
				FixturePick.update({
				 user: req.user.id,
				 fixture: req.body.fixtureId,
				 round: req.body.roundId,
				 competition: req.body.competitionId},
				 {$set: pickData},
				 {upsert: true},
				 function(err){
				 	if(err){callback_db('Pick not saved');}
				 	else {callback_db(null);}
				 }
				);
			}
		],
			function (err, results){
				if (err) {req.flash('dangerMsg','Pick not saved');}
				else {req.flash('successMsg', 'Pick recorded');}
				//console.log('now doing redirect');
				res.redirect('fixtures?competition='+req.body.competitionId+'&round='+req.body.roundId);							
			}
		);

	});
	
	// =====================================
	// ADMIN - RESULTS ADMIN ===============
	// =====================================

	// LIST LEAGUES
	app.get('/resultAdmin', isLoggedIn, function(req, res) {
		
		if (req.user.roles.indexOf('resultAdmin')==-1){
			req.flash('dangerMsg', 'You do not have authoirsation to access the Result Administration page');
			res.redirect('competitions');
		}
		else {
			var League = require('../app/models/league');
			League.find().exec(function(err,leagues){
				if (err){console.log(err)}
				else {
					res.render('resultAdmin.ejs', {
						user : req.user, // get the user out of session and pass to template
						leagues: leagues,
						successMsg: req.flash('successMsg'),
						dangerMsg: req.flash('dangerMsg'),
						warningMsg: req.flash('warningMsg')
						});
				}
			});
		}
	});		
		
	// LIST EVENTS IN LEAGUE
	app.get('/resultAdmin/events', isLoggedIn, function(req, res) {
		
		if (req.user.roles.indexOf('resultAdmin')==-1){
			req.flash('dangerMsg', 'You do not have authoirsation to access the Result Administration page');
			res.redirect('competitions');
		}
		else {
			var League = require('../app/models/league');
			var Event = require('../app/models/event');
			
			League.findById(req.param('league')).exec(function (err, league){
				if (err){console.log(err)}
				else{
					Event.find({league:req.param('league')}).exec(function(err,events){
						if (err){console.log(err)}
						else {
							res.render('resultAdminEvent.ejs', {
								user : req.user, // get the user out of session and pass to template
								league: league,
								events: events,
								successMsg: req.flash('successMsg'),
								dangerMsg: req.flash('dangerMsg'),
								warningMsg: req.flash('warningMsg')
								});
						}
					});
				}
			});
		}
	});
	// LIST ROUNDS IN EVENT
	app.get('/resultAdmin/rounds', isLoggedIn, function(req, res) {
		
		if (req.user.roles.indexOf('resultAdmin')==-1){
			req.flash('dangerMsg', 'You do not have authoirsation to access the Result Administration page');
			res.redirect('competitions');
		}
		else {
			var Round = require('../app/models/round');
			var League = require('../app/models/league');
			var Event = require('../app/models/event');
			Round.find({event:req.param('event')}).sort('roundPosition').exec(function(err,rounds){
				if (err){console.log(err)}
				else {
					Event.findById(req.param('event')).exec(function (err,event){
						if (err){console.log(err)}
						else {
							League.findById(event.league).exec(function(err, league){
								if (err){console.log(err)}
								else {
									res.render('resultAdminRound.ejs', {
										user : req.user, // get the user out of session and pass to template
										league: league,
										event: event,
										rounds: rounds,
										successMsg: req.flash('successMsg'),
										dangerMsg: req.flash('dangerMsg'),
										warningMsg: req.flash('warningMsg')
										});
								}
							});										
						}
					});								
				}
			});
		}
	});
	// LIST FIXTURES IN ROUND
	app.get('/resultAdmin/fixtures', isLoggedIn, function(req, res) {
		
		if (req.user.roles.indexOf('resultAdmin')==-1){
			req.flash('dangerMsg', 'You do not have authoirsation to access the Result Administration page');
			res.redirect('competitions');
		}
		else {
			var Fixture = require('../app/models/fixture');			
			var Round = require('../app/models/round');
			var League = require('../app/models/league');
			var Event = require('../app/models/event');
			var Team = require('../app/models/team'); // needed for populate function
			
			Fixture.find({round:req.param('round')}).sort('date').populate('homeTeam awayTeam').exec(function(err, fixtures){
				if(err){console.log(err)}
				else {
					Round.findById(req.param('round')).sort('roundPosition').exec(function(err,round){
						if (err){console.log(err)}
						else {
							Event.findById(round.event).exec(function (err,event){
								if (err){console.log(err)}
								else {
									League.findById(event.league).exec(function(err, league){
										if (err){console.log(err)}
										else {
											res.render('resultAdminFixture.ejs', {
												user : req.user, // get the user out of session and pass to template
												league: league,
												event: event,
												round: round,
												fixtures: fixtures,
												successMsg: req.flash('successMsg'),
												dangerMsg: req.flash('dangerMsg'),
												warningMsg: req.flash('warningMsg')
												});
										}
									});										
								}
							});								
						}
					});
				}						
			});						
		}
	});

	// UPDATE FIXTURE RESULT
	app.get('/resultAdmin/updateFixture', isLoggedIn, function(req, res) {
		if (req.user.roles.indexOf('resultAdmin')==-1){
			req.flash('dangerMsg', 'You do not have authoirsation to access the Result Administration page');
			res.redirect('competitions');
		}
		else {
			var Fixture = require('../app/models/fixture');			
			var Round = require('../app/models/round');
			var League = require('../app/models/league');
			var Event = require('../app/models/event');
			var Team = require('../app/models/team'); // needed for populate function
			var moment = require('moment-timezone');
			
			Fixture.findById(req.param('fixture')).populate('homeTeam awayTeam').sort('date').exec(function(err, fixture){
				if(err){console.log(err)}
				else {
					Round.findById(fixture.round).sort('roundPosition').exec(function(err,round){
						if (err){console.log(err)}
						else {
							Event.findById(round.event).exec(function (err,event){
								if (err){console.log(err)}
								else {
									League.findById(event.league).exec(function(err, league){
										if (err){console.log(err)}
										else {
											Team.find({league:league}).exec(function (err, teams){
												if(err) {console.log('could not find teams')}
												else {
													res.render('resultAdminupdateFixture.ejs', {
														user : req.user, // get the user out of session and pass to template
														league: league,
														event: event,
														round: round,
														fixture: fixture,
														teams: teams,
														timezones: moment.tz.names(),
														successMsg: req.flash('successMsg'),
														dangerMsg: req.flash('dangerMsg'),
														warningMsg: req.flash('warningMsg'),
														});
													}
											});
										}
									});										
								}
							});								
						}
					});
				}						
			});						
		}
	});
	
	// PROCESS RESULT UPDATE
	app.post('/resultAdmin/submitResultUpdate', isLoggedIn, function(req, res) {
		if (req.user.roles.indexOf('resultAdmin')==-1){
			req.flash('dangerMsg', 'You do not have authoirsation to access the Result Administration page');
			res.redirect('competitions');
		}
		else {
		    var Competition = require('../app/models/competition');
		    var FixturePick = require('../app/models/fixturePick');
		    var User = require('../app/models/user');
		    var Point = require('../app/models/point');
			var Fixture = require('../app/models/fixture');			
			var League = require('../app/models/league');
			var Event = require('../app/models/event');			
			var Team = require('../app/models/team');

			var async = require('async');
			var scoring = require('./scoring');													
			var statistics = require('./statistics');				

			Fixture.findById(req.param('fixtureId')).populate('homeTeam').populate('awayTeam').exec(function (err, fixture){
				if (err){console.log(err)}
				else {
					Event.findById(fixture.event).populate('league').exec(function(err, event){
						if (err) {console.log(err)}
						else {
							// run the statistics for the fixture (timing is not important for this as it can be run anytime after picks are closed)
							statistics.storeCompetitionFixtureStatistics(fixture._id);

							async.series([
								function(callback){
									// Updating the fixcture Data before scoring
									if (event.league.name == 'A-League') {
										
										var aLeagueDrawTeamId = '53fc6399b918a6b661d423b8';
										
										fixture.homeScore = req.param('homeScore');
										fixture.awayScore = req.param('awayScore');
										
					                   if (req.param('homeScore') == req.param('awayScore')){
					                       fixture.winner = aLeagueDrawTeamId;
					                       fixture.scoreDifference = 0;
					                       fixture.homeTeamLeaguePoints =1;
					                       fixture.awayTeamLeaguePoints = 1;
					                   }
					                    else {
					                        fixture.scoreDifference = Math.abs(req.param('homeScore')-req.param('awayScore'));
					                        if(req.param('homeScore')>req.param('awayScore')){
					                            fixture.winner = fixture.homeTeam._id;
					                            fixture.homeTeamLeaguePoints=3;
					                        }
					                        else{
					                            fixture.winner = fixture.awayTeam._id;
					                            fixture.awayTeamLeaguePoints=3;}
					                    }
									}
									// end a-lequge fixture result update
									
									if (event.league.name == 'Super Rugby'){
				        				var super15DrawTeamId = '54dedf115d82d635c1c414e4';
				        				var homeTeamLeaguePoints = 0;
				        				var awayTeamLeaguePoints = 0;
				        				
										if (req.param('homeScore')) {fixture.homeScore = req.param('homeScore');} else {fixture.homeScore = 0;}
										if (req.param('awayScore')) {fixture.awayScore = req.param('awayScore');} else {fixture.awayScore = 0;}
										if (req.param('homeTries')) {fixture.homeTries = req.param('homeTries');} else {fixture.homeTries = 0;}
										if (req.param('awayTries')) {fixture.awayTries = req.param('awayTries');} else {fixture.awayTries = 0;}
				
					                   if (fixture.homeScore == fixture.awayScore){
					                   		console.log('Its a draw');
					                       fixture.winner = super15DrawTeamId;
					                       fixture.scoreDifference = 0;
					                       homeTeamLeaguePoints += 2;
					                       awayTeamLeaguePoints += 2;
					                   }
					                    else {
					                        fixture.scoreDifference = Math.abs(fixture.homeScore-fixture.awayScore);
					                        
					                        if(fixture.homeScore>fixture.awayScore){
					                        	console.log('home team won!');
					                        	console.log("Triess %s: %s", fixture.homeTries, fixture.awayTries);
					                            fixture.winner = fixture.homeTeam._id;
					                            homeTeamLeaguePoints+=4;
					                        }
					                        else{
					                        	console.log('away team won');
					                            fixture.winner = fixture.awayTeam._id;
					                            awayTeamLeaguePoints+=4;}
					                    }
					                    
					                    // super rugby bonus points
					                    if (fixture.homeTries>=4){homeTeamLeaguePoints += 1 }
					                    if (fixture.awayTries>=4){awayTeamLeaguePoints += 1 }
					                    if (fixture.scoreDifference < 7){
					                        if(fixture.homeScore>fixture.awayScore){
					                            awayTeamLeaguePoints+=1;
					                        }
					                        else{
					                            homeTeamLeaguePoints+=1;}
					                    }
					                    
					                    fixture.homeTeamLeaguePoints = homeTeamLeaguePoints;
					                    fixture.awayTeamLeaguePoints = awayTeamLeaguePoints;
									}
									// end super rugby fixture result update
									
									// save the fixture
									console.log('fixture saved2');
									fixture.save();
									callback(null);
								},
								function(callback){setTimeout(function(){console.log('Pause1');callback(null);},1000);}, // adding a timeout to make sure database has scoring data ready to read								
								scoring.scoreFixture(fixture._id),
								scoring.updateCompetitionFixtureRanking(fixture),
								scoring.updateCompetitionRoundRanking(fixture),
								scoring.updateCompetitionEventRanking(fixture),
								statistics.updateCummulativeRoundPoints(fixture.event)
								], function(err){
									console.log('in exit fn');
									if (err) {console.log(err);req.flash('dangerMsg', "Error in fixture ranking, check the console log")}
									else {req.flash('successMsg', 'Fixture:'+fixture._id+'['+fixture.homeTeam.name+' v '+ fixture.awayTeam.name+'] updated');}
									//req.flash('warningMsg', 'NO SAVE as testing mode');
									res.redirect('/resultAdmin/fixtures?round='+fixture.round);

								});
						}
					});
		
				}
			});
		
		}
	});
	
	app.post('/fixtureAdmin', isLoggedIn, function (req, res){
		if (req.user.roles.indexOf('resultAdmin')==-1){
			req.flash('dangerMsg', 'You do not have authoirsation to access the Result Administration page');
			res.redirect('competitions');
		}
		else {
			//console.log('FIXTURE ID'); console.log(req.param('fixtureId'))
			//console.log('AWAYTEAM body'); console.log(req.param('awayTeam'));
			var Fixture = require('../app/models/fixture');
            Fixture.update({_id: req.param('fixtureId')},
                {$set: {homeTeam:req.param('homeTeam'), awayTeam: req.param('awayTeam') }},
                {upsert: false},
                function(err){
                    if (err) {req.flash('dangerMsg','Fixture failed to update'); res.redirect('/resultAdmin/updateFixture?fixture='+req.param('fixtureId'))}
                    else {
                    	req.flash('successMsg','Fixture updated, you may have to resubmit the round for scoring');res.redirect('/resultAdmin/updateFixture?fixture='+req.param('fixtureId'));
                    }
                    
                }
            );
		}
	});
	
	app.post('/fixtureAdmin/updateDate', isLoggedIn, function(req,res){
		if (req.user.roles.indexOf('resultAdmin')==-1){
			req.flash('dangerMsg', 'You do not have authoirsation to access the Result Administration page');
			res.redirect('competitions');
		}
		else{
			// take timezone and date and convert to new UTC date and update the fixture.
			console.log('DATE');console.log(req.param('date'));
			console.log('TIMEZONE'); console.log(req.param('timezone'));
			var newTime = convertTime(req.param('date'), req.param('timezone'),"UTC"); // convert input time to UTC for storing in database.
			if (newTime==undefined){
				req.flash('dangerMsg', 'Error in time format use YYYY-MM-DD HH:mm'); res.redirect('/resultAdmin/updateFixture?fixture='+req.param('fixtureId'));
			}
			else {
				var Fixture = require('../app/models/fixture');
				Fixture.update({_id: req.param('fixtureId')},
	                {$set: {date: newTime }},
	                {upsert: false},
	                function(err){
	                    if (err) {req.flash('dangerMsg','Fixture date failed to store in database'); res.redirect('/resultAdmin/updateFixture?fixture='+req.param('fixtureId'))}
	                    else {
	                    	req.flash('successMsg','Fixture date updated, UTC Time of: '+newTime+' stored');res.redirect('/resultAdmin/updateFixture?fixture='+req.param('fixtureId'));
	                    }
	                    
		            }
	            );
			}
		}		
	});

};


// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
	// if user is authenticated in the session, carry on 
	if (req.isAuthenticated()){return next();}

	req.session.postAuthRedirect = req.originalUrl;
	req.flash('warningMsg', 'Please login to continue');
	res.redirect('/');
}

function createFixturePicksByRoundLookup(queryData){
	//console.log('making lookup from:');
	//console.log(queryData);
	var lookup = {};
	for (var i = 0; i<queryData.length; i++){
		lookup[queryData[i]._id] = queryData[i].count;
	}
	//console.log('RETUNING LOOKUP DATA');
	//console.log(lookup);
	
	return lookup;
}


function roundsStatusDisplay(rounds,userPoints,fixturePicksByRound){
	// takes a list of rounds and adds html to call on the rounds page
	//information to allow rounds list to be displayed properly.
	// it is easier to put the logic in here than in the template
	// userPoints is the users points with a lookup by round added.
	// A flag is also put in to round[0] to advise the round page generator that there are rounds closing soon
	// so the page generator knows to put a rounds closing soon heading in.
	//console.log("LOOKUP %s",fixturePicksByRound['542bd1842367c9209a73913d'])
	//console.log('IS THIS THE RIGHT DATA:');
	//console.log(fixturePicksByRound);
	
	if (rounds.length > 0){
		// if there is rounds data then create a false closeDate flag
		rounds[0].roundsClosingSoon = false;
	}

	rounds.forEach(function (round){
		round.closingSoon = false;
		if (round.firstFixtureDate<Date.now()){
			//if round is closed
			if(round.lastFixtureDate>(Date.now())-(1000*60*60*24*2)){ //+(1000*60*60*24*2)
				//but the last fixture date + 2 days is before now (added two days to give me a chance to do the scoring)
				if (round._id in userPoints){
					round.viewBadge = '<span class="badge alert-warning">'+userPoints[round._id].points+'</span>';
				}
				else {
					round.viewBadge = '<span class="badge alert-warning">&nbsp-&nbsp</span>';
				}
			}
			else {
				// if the round should all be scored and good to go then
				if (round._id in userPoints){
				// and round has points
				round.viewBadge = '<span class="badge">'+userPoints[round._id].points+'</span>';
				}
				else {
					// round has not been scored yet
					round.viewBadge = '<span class="badge alert-warning">&nbsp-&nbsp</span>';
				}
			}
		}
		else {
			// round has not closed yet

			if (round.firstFixtureDate <= (Date.now()+(1000*60*60*24*7))){
				// if there are rounds closing soon we mark round[0] so that the page generator
				// can put in the relevent heading and mark the rounds as closing soon.
				round.closingSoon = true;
				rounds[0].roundsClosingSoon = true;
			}

			// find how many picks theuser has done for the round
			if (fixturePicksByRound[round._id]>=round.numberOfFixtures){ 
				// if the user has done all the picks in the rounds mark it done.
				round.viewBadge = '<span class="label label-success pull-right"><span class="fa fa-check"></span>&nbsp closes:<script type="text/javascript">localTime("'+round.firstFixtureDate+'","-1");</script></span>';
			}
			else {
				//not all picks done for round
				if (round.firstFixtureDate <= (Date.now()+(1000*60*60*24*3))){
					// if round closes in the next 3 days mark it red to warn player
					round.viewBadge='<span class="label label-danger pull-right\"><span class="fa fa-warning"></span>&nbsp closes:<script type="text/javascript">localTime("'+round.firstFixtureDate+'","-1");</script></span>';
				}
				else {
					round.viewBadge='<span class="label label-default pull-right">closes:<script type="text/javascript">localTime("'+round.firstFixtureDate+'","-1");</script></span>';
				}
			}
		}
	});
	return rounds;
}

function createCjsDataPointHistory(pointsData,userId){
    // takes a competition ID and formats the data so that ChartJS can
    // draw the chart on the website
	try {
		//console.log("THIS IS CHART DATA");
		var chartData = {};
	    chartData.labels = pointsData[0].historyTitles;
	    //console.log(pointsData[0]);
	    chartData.datasets=[];
	    pointsData.forEach(function (point){
	        var dataset = {};
	        dataset.label = point.user.displayName;
	        dataset.data = point.cummulativePointsHistory;
			//console.log('user:%s ranking: %s', point.user.displayName, point.ranking);
	        if (String(userId) == String(point.user._id)){
		        dataset.fillColor= "rgba(220,220,220,0.1)";
		        dataset.strokeColor= "rgba(180,0,0,1)";
		        dataset.pointColor= "rgba(180,0,0,1)";
		        dataset.pointStrokeColor= "#fff";
		        dataset.pointHighlightFill= "#fff";
		        dataset.pointHighlightStroke= "rgba(180,0,0,1)";
	        }
	        else {
   		        if (point.ranking == 1){
			        dataset.fillColor= "rgba(220,220,220,0.1)";
			        dataset.strokeColor= "rgba(128,128,128,1)";
			        dataset.pointColor= "rgba(128,128,128,1)";
			        dataset.pointStrokeColor= "#fff";
			        dataset.pointHighlightFill= "#fff";
			        dataset.pointHighlightStroke= "rgba(128,128,128,1)";
		        }
		        else {
			        dataset.fillColor= "rgba(220,220,220,0.1)";
			        dataset.strokeColor= "rgba(220,220,220,1)";
			        dataset.pointColor= "rgba(220,220,220,1)";
			        dataset.pointStrokeColor= "#fff";
			        dataset.pointHighlightFill= "#fff";
			        dataset.pointHighlightStroke= "rgba(220,220,220,1)";
		        }
	        }
	        //console.log(dataset);
	        chartData.datasets.push(dataset);
    	});
    	chartData.datasets.sort(function compare(a,b) {if (a.label < b.label){return -1};if (a.label > b.label){return 1};return 0;});
    	return (chartData);
	}
	catch (err) {
		//probably end up here because there is no points History Data
		return undefined;
	}
}

function createCompetitionLookup(queryData){
	var lookup = {};
	//console.log('DataLength:%s',queryData.length);
	//console.log('ALL RANK DATA:\n%s',queryData);
	//console.log('QUERYDATA:0\n%s',queryData[0]);
	//console.log('QUERYDATA:0\n%s',queryData[1]);
	for (var i = 0; i<queryData.length; i++){
		//console.log('QUERYDATA %s',i);
		//console.log(queryData[i]);
		//console.log(queryData[i]);
		lookup[queryData[i].competition] = queryData[i];
	}
	return lookup;
}

function createRoundLookup(queryData){
	//console.log('ALL RANK DATA:\n%s',queryData);
	var lookup = {};
	for (var i = 0; i<queryData.length; i++){
		lookup[queryData[i].round] = queryData[i];
	}
	return lookup;
}

function createFixtureLookup(queryData){
	//console.log('ALL RANK DATA:\n%s',queryData);
	var lookup = {};
	for (var i = 0; i<queryData.length; i++){
		lookup[queryData[i].fixture] = queryData[i];
	}
	return lookup;
}

function createIdLookup(queryData){
	//console.log('ALL RANK DATA:\n%s',queryData);
	var lookup = {};
	for (var i = 0; i<queryData.length; i++){
		lookup[queryData[i].id] = queryData[i];
	}
	return lookup;
}

function localiseTime(utcTime,localTimezone){
    var moment = require('moment-timezone');
    var origTime =moment.tz(utcTime,"UTC");
    var localTime = origTime.clone().tz(localTimezone);
    return localTime;
}

function localiseCloseDate(data,localTimezone){
	//relies on the data having a "closeDate" 
	//uses moment-timezone timezone descriptions.
	//converts dates in closeDate to users set local time.
	data.closeDate = localiseTime(data.closeDate,localTimezone);
	return data;
}


function localiseCloseDates(data,localTimezone){
	//relies on the data having a "closeDate" 
	//uses moment-timezone timezone descriptions.
	//converts dates in closeDate to users set local time.
	data.forEach(function (item){
		item.closeDateLocalTime == localiseTime(item.closeDate,localTimezone);
	});
	return data;
}

function convertTime(time,inZone,outZone){
    var moment = require('moment-timezone');
    if (moment(time,'YYYY-MM-DD HH:mm',true).isValid() && moment.tz.zone(inZone)!=null && moment.tz.zone(inZone)!=null ) {
    	// check if time is in correct format and if the timezones passed are valid.
        var inTime = moment.tz(time, inZone);
        var outTime = inTime.clone().tz(outZone);
       	return outTime.format();        	
    }
    else {
    	return undefined;
    }
}


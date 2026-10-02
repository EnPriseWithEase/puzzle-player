INSERT INTO deck (name, config, folder)
VALUES
    ('Annihilation',      '{"puzzle_type":"standard","review_order":"random","retain":"none"}', 'Tactic Ninja'),
    ('Attraction',        '{"puzzle_type":"standard","review_order":"random","retain":"none"}', 'Tactic Ninja'),
    ('Blocking',          '{"puzzle_type":"standard","review_order":"random","retain":"none"}', 'Tactic Ninja'),
    ('Clearance',         '{"puzzle_type":"standard","review_order":"random","retain":"none"}', 'Tactic Ninja'),
    ('Counterthreat',     '{"puzzle_type":"standard","review_order":"random","retain":"none"}', 'Tactic Ninja'),
    ('Deflection',        '{"puzzle_type":"standard","review_order":"random","retain":"none"}', 'Tactic Ninja'),
    ('Destroying',        '{"puzzle_type":"standard","review_order":"random","retain":"none"}', 'Tactic Ninja'),
    ('Discovered Attack', '{"puzzle_type":"standard","review_order":"random","retain":"none"}', 'Tactic Ninja'),
    ('Discovered Check',  '{"puzzle_type":"standard","review_order":"random","retain":"none"}', 'Tactic Ninja'),
    ('Distraction',       '{"puzzle_type":"standard","review_order":"random","retain":"none"}', 'Tactic Ninja'),
    ('Double Attack',     '{"puzzle_type":"standard","review_order":"random","retain":"none"}', 'Tactic Ninja'),
    ('Double Check',      '{"puzzle_type":"standard","review_order":"random","retain":"none"}', 'Tactic Ninja'),
    ('Fork',              '{"puzzle_type":"standard","review_order":"random","retain":"none"}', 'Tactic Ninja'),
    ('Interference',      '{"puzzle_type":"standard","review_order":"random","retain":"none"}', 'Tactic Ninja'),
    ('Intermezzo',        '{"puzzle_type":"standard","review_order":"random","retain":"none"}', 'Tactic Ninja'),
    ('Mixed',             '{"puzzle_type":"standard","review_order":"random","retain":"none"}', 'Tactic Ninja'),
    ('Pin',               '{"puzzle_type":"standard","review_order":"random","retain":"none"}', 'Tactic Ninja'),
    ('Promotion',         '{"puzzle_type":"standard","review_order":"random","retain":"none"}', 'Tactic Ninja'),
    ('Skewer',            '{"puzzle_type":"standard","review_order":"random","retain":"none"}', 'Tactic Ninja'),
    ('Throwing a Bomb',   '{"puzzle_type":"standard","review_order":"random","retain":"none"}', 'Tactic Ninja'),
    ('Windmill',          '{"puzzle_type":"standard","review_order":"random","retain":"none"}', 'Tactic Ninja'),
    ('Xray',              '{"puzzle_type":"standard","review_order":"random","retain":"none"}', 'Tactic Ninja');

insert into deck_puzzle select (select  id from deck where name = 'Annihilation')      as deck, id as puzzle, '{"status":"unreviewed"}' as config from puzzle where pgn like '%tactics - annihilation%';
insert into deck_puzzle select (select  id from deck where name = 'Attraction')        as deck, id as puzzle, '{"status":"unreviewed"}' as config from puzzle where pgn like '%tactics - attraction%';
insert into deck_puzzle select (select  id from deck where name = 'Blocking')          as deck, id as puzzle, '{"status":"unreviewed"}' as config from puzzle where pgn like '%tactics - blocking%';
insert into deck_puzzle select (select  id from deck where name = 'Clearance')         as deck, id as puzzle, '{"status":"unreviewed"}' as config from puzzle where pgn like '%tactics - clearance%';
insert into deck_puzzle select (select  id from deck where name = 'Counterthreat')     as deck, id as puzzle, '{"status":"unreviewed"}' as config from puzzle where pgn like '%tactics - counterthreat%';
insert into deck_puzzle select (select  id from deck where name = 'Deflection')        as deck, id as puzzle, '{"status":"unreviewed"}' as config from puzzle where pgn like '%tactics - deflection%';
insert into deck_puzzle select (select  id from deck where name = 'Destroying')        as deck, id as puzzle, '{"status":"unreviewed"}' as config from puzzle where pgn like '%tactics - destroying%';
insert into deck_puzzle select (select  id from deck where name = 'Discovered Attack') as deck, id as puzzle, '{"status":"unreviewed"}' as config from puzzle where pgn like '%tactics - discovered_attack%';
insert into deck_puzzle select (select  id from deck where name = 'Discovered Check')  as deck, id as puzzle, '{"status":"unreviewed"}' as config from puzzle where pgn like '%tactics - discovered_check%';
insert into deck_puzzle select (select  id from deck where name = 'Distraction')       as deck, id as puzzle, '{"status":"unreviewed"}' as config from puzzle where pgn like '%tactics - distraction%';
insert into deck_puzzle select (select  id from deck where name = 'Double Attack')     as deck, id as puzzle, '{"status":"unreviewed"}' as config from puzzle where pgn like '%tactics - double_attack%';
insert into deck_puzzle select (select  id from deck where name = 'Double Check')      as deck, id as puzzle, '{"status":"unreviewed"}' as config from puzzle where pgn like '%tactics - double_check%';
insert into deck_puzzle select (select  id from deck where name = 'Fork')              as deck, id as puzzle, '{"status":"unreviewed"}' as config from puzzle where pgn like '%tactics - fork%';
insert into deck_puzzle select (select  id from deck where name = 'Interference')      as deck, id as puzzle, '{"status":"unreviewed"}' as config from puzzle where pgn like '%tactics - interference%';
insert into deck_puzzle select (select  id from deck where name = 'Intermezzo')        as deck, id as puzzle, '{"status":"unreviewed"}' as config from puzzle where pgn like '%tactics - intermezzo%';
insert into deck_puzzle select (select  id from deck where name = 'Mixed')             as deck, id as puzzle, '{"status":"unreviewed"}' as config from puzzle where pgn like '%tactics - mixed%';
insert into deck_puzzle select (select  id from deck where name = 'Pin')               as deck, id as puzzle, '{"status":"unreviewed"}' as config from puzzle where pgn like '%tactics - pin%';
insert into deck_puzzle select (select  id from deck where name = 'Promotion')         as deck, id as puzzle, '{"status":"unreviewed"}' as config from puzzle where pgn like '%tactics - promotion%';
insert into deck_puzzle select (select  id from deck where name = 'Skewer')            as deck, id as puzzle, '{"status":"unreviewed"}' as config from puzzle where pgn like '%tactics - skewer%';
insert into deck_puzzle select (select  id from deck where name = 'Throwing a Bomb')   as deck, id as puzzle, '{"status":"unreviewed"}' as config from puzzle where pgn like '%tactics - throwing_a_bomb%';
insert into deck_puzzle select (select  id from deck where name = 'Windmill')          as deck, id as puzzle, '{"status":"unreviewed"}' as config from puzzle where pgn like '%tactics - windmill%';
insert into deck_puzzle select (select  id from deck where name = 'Xray')              as deck, id as puzzle, '{"status":"unreviewed"}' as config from puzzle where pgn like '%tactics - xray%';

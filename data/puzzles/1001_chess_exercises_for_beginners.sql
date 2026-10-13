INSERT INTO deck (name, config, folder)
VALUES
    ('All',               '{"puzzle_type":"standard","review_order":"random","retain":"none"}', '1001 Chess Exercises'),
    ('Attraction',        '{"puzzle_type":"standard","review_order":"random","retain":"none"}', '1001 Chess Exercises'),
    ('Curiosities',       '{"puzzle_type":"standard","review_order":"random","retain":"none"}', '1001 Chess Exercises'),
    ('Deflection',        '{"puzzle_type":"standard","review_order":"random","retain":"none"}', '1001 Chess Exercises'),
    ('Discovered Attack', '{"puzzle_type":"standard","review_order":"random","retain":"none"}', '1001 Chess Exercises'),
    ('Discovered Check',  '{"puzzle_type":"standard","review_order":"random","retain":"none"}', '1001 Chess Exercises'),
    ('Double Attack',     '{"puzzle_type":"standard","review_order":"random","retain":"none"}', '1001 Chess Exercises'),
    ('Double Check',      '{"puzzle_type":"standard","review_order":"random","retain":"none"}', '1001 Chess Exercises'),
    ('Draw',              '{"puzzle_type":"standard","review_order":"random","retain":"none"}', '1001 Chess Exercises'),
    ('Mate in One',       '{"puzzle_type":"standard","review_order":"random","retain":"none"}', '1001 Chess Exercises'),
    ('Mate in Two',       '{"puzzle_type":"standard","review_order":"random","retain":"none"}', '1001 Chess Exercises'),
    ('Mate in Three',     '{"puzzle_type":"standard","review_order":"random","retain":"none"}', '1001 Chess Exercises'),
    ('Mate in Four',      '{"puzzle_type":"standard","review_order":"random","retain":"none"}', '1001 Chess Exercises'),
    ('Mixed',             '{"puzzle_type":"standard","review_order":"random","retain":"none"}', '1001 Chess Exercises'),
    ('Pin',               '{"puzzle_type":"standard","review_order":"random","retain":"none"}', '1001 Chess Exercises'),
    ('Promotion',         '{"puzzle_type":"standard","review_order":"random","retain":"none"}', '1001 Chess Exercises'),
    ('Skewer',            '{"puzzle_type":"standard","review_order":"random","retain":"none"}', '1001 Chess Exercises');

insert into deck_puzzle select (select  id from deck where name = 'All'                and config like '%1001 Chess Exercises%') as deck, id as puzzle, '{"status":"unreviewed"}' as config from puzzle where pgn like '%masetti - %';
insert into deck_puzzle select (select  id from deck where name = 'Attraction'         and config like '%1001 Chess Exercises%') as deck, id as puzzle, '{"status":"unreviewed"}' as config from puzzle where pgn like '%masetti - attraction%';
insert into deck_puzzle select (select  id from deck where name = 'Curiosities'        and config like '%1001 Chess Exercises%') as deck, id as puzzle, '{"status":"unreviewed"}' as config from puzzle where pgn like '%masetti - curiosities%';
insert into deck_puzzle select (select  id from deck where name = 'Deflection'         and config like '%1001 Chess Exercises%') as deck, id as puzzle, '{"status":"unreviewed"}' as config from puzzle where pgn like '%masetti - deflection%';
insert into deck_puzzle select (select  id from deck where name = 'Discovered Attack'  and config like '%1001 Chess Exercises%') as deck, id as puzzle, '{"status":"unreviewed"}' as config from puzzle where pgn like '%masetti - discovered attack%';
insert into deck_puzzle select (select  id from deck where name = 'Discovered Check'   and config like '%1001 Chess Exercises%') as deck, id as puzzle, '{"status":"unreviewed"}' as config from puzzle where pgn like '%masetti - discovered check%';
insert into deck_puzzle select (select  id from deck where name = 'Double Attack'      and config like '%1001 Chess Exercises%') as deck, id as puzzle, '{"status":"unreviewed"}' as config from puzzle where pgn like '%masetti - double attack%';
insert into deck_puzzle select (select  id from deck where name = 'Double Check'       and config like '%1001 Chess Exercises%') as deck, id as puzzle, '{"status":"unreviewed"}' as config from puzzle where pgn like '%masetti - double check%';
insert into deck_puzzle select (select  id from deck where name = 'Draw'               and config like '%1001 Chess Exercises%') as deck, id as puzzle, '{"status":"unreviewed"}' as config from puzzle where pgn like '%masetti - draw%';
insert into deck_puzzle select (select  id from deck where name = 'Mate in One'        and config like '%1001 Chess Exercises%') as deck, id as puzzle, '{"status":"unreviewed"}' as config from puzzle where pgn like '%masetti - mate in one%';
insert into deck_puzzle select (select  id from deck where name = 'Mate in Two'        and config like '%1001 Chess Exercises%') as deck, id as puzzle, '{"status":"unreviewed"}' as config from puzzle where pgn like '%masetti - mate in two%';
insert into deck_puzzle select (select  id from deck where name = 'Mate in Three'      and config like '%1001 Chess Exercises%') as deck, id as puzzle, '{"status":"unreviewed"}' as config from puzzle where pgn like '%masetti - mate in three%';
insert into deck_puzzle select (select  id from deck where name = 'Mate in Four'       and config like '%1001 Chess Exercises%') as deck, id as puzzle, '{"status":"unreviewed"}' as config from puzzle where pgn like '%masetti - mate in four%';
insert into deck_puzzle select (select  id from deck where name = 'Mixed'              and config like '%1001 Chess Exercises%') as deck, id as puzzle, '{"status":"unreviewed"}' as config from puzzle where pgn like '%masetti - mixed%';
insert into deck_puzzle select (select  id from deck where name = 'Pin'                and config like '%1001 Chess Exercises%') as deck, id as puzzle, '{"status":"unreviewed"}' as config from puzzle where pgn like '%masetti - pin%';
insert into deck_puzzle select (select  id from deck where name = 'Promotion'          and config like '%1001 Chess Exercises%') as deck, id as puzzle, '{"status":"unreviewed"}' as config from puzzle where pgn like '%masetti - promotion%';
insert into deck_puzzle select (select  id from deck where name = 'Skewer'             and config like '%1001 Chess Exercises%') as deck, id as puzzle, '{"status":"unreviewed"}' as config from puzzle where pgn like '%masetti - skewer%';


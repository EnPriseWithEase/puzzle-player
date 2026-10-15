INSERT INTO deck (name, config, folder)
VALUES
    ('Mate in One',      '{"puzzle_type":"standard","review_order":"random","retain":"none"}', 'Polgar Book'),
    ('Mate in Two',      '{"puzzle_type":"standard","review_order":"sequential","retain":"none"}', 'Polgar Book'),
    ('Mate in Three',    '{"puzzle_type":"standard","review_order":"sequential","retain":"none"}', 'Polgar Book');

insert into deck_puzzle select (select  id from deck where name = 'Mate in One'    and folder = 'Polgar Book') as deck, id as puzzle, '{"status":"unreviewed"}' as config from puzzle where pgn like '%polgar - mate in one%';
insert into deck_puzzle select (select  id from deck where name = 'Mate in Two'    and folder = 'Polgar Book') as deck, id as puzzle, '{"status":"unreviewed"}' as config from puzzle where pgn like '%polgar - mate in two%';
insert into deck_puzzle select (select  id from deck where name = 'Mate in Three'  and folder = 'Polgar Book') as deck, id as puzzle, '{"status":"unreviewed"}' as config from puzzle where pgn like '%polgar - mate in three%';

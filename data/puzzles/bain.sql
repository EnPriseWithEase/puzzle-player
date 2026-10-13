INSERT INTO deck (name, config, folder)
VALUES
    ('All',               '{"puzzle_type":"standard","review_order":"random","retain":"none"}', 'Bain'),
    ('Back Rank Mate',    '{"puzzle_type":"standard","review_order":"random","retain":"none"}', 'Bain'),
    ('Discovered Attack', '{"puzzle_type":"standard","review_order":"random","retain":"none"}', 'Bain'),
    ('Discovered Check',  '{"puzzle_type":"standard","review_order":"random","retain":"none"}', 'Bain'),
    ('Double Attack',     '{"puzzle_type":"standard","review_order":"random","retain":"none"}', 'Bain'),
    ('Double Check',      '{"puzzle_type":"standard","review_order":"random","retain":"none"}', 'Bain'),
    ('Fork',              '{"puzzle_type":"standard","review_order":"random","retain":"none"}', 'Bain'),
    ('Mixed',             '{"puzzle_type":"standard","review_order":"random","retain":"none"}', 'Bain'),
    ('Perpetual Check',   '{"puzzle_type":"standard","review_order":"random","retain":"none"}', 'Bain'),
    ('Perturbation',      '{"puzzle_type":"standard","review_order":"random","retain":"none"}', 'Bain'),
    ('Pin',               '{"puzzle_type":"standard","review_order":"random","retain":"none"}', 'Bain'),
    ('Promotion',         '{"puzzle_type":"standard","review_order":"random","retain":"none"}', 'Bain'),
    ('Skewer',            '{"puzzle_type":"standard","review_order":"random","retain":"none"}', 'Bain'),
    ('Stalemate',         '{"puzzle_type":"standard","review_order":"random","retain":"none"}', 'Bain'),
    ('Zugzwang',          '{"puzzle_type":"standard","review_order":"random","retain":"none"}', 'Bain');


insert into deck_puzzle select (select  id from deck where name = 'All'                and config like '%Bain%') as deck, id as puzzle, '{"status":"unreviewed"}' as config from puzzle where pgn like '%bain - %';
insert into deck_puzzle select (select  id from deck where name = 'Back Rank Mate'     and config like '%Bain%') as deck, id as puzzle, '{"status":"unreviewed"}' as config from puzzle where pgn like '%bain - back rank mate%';
insert into deck_puzzle select (select  id from deck where name = 'Discovered Attack'  and config like '%Bain%') as deck, id as puzzle, '{"status":"unreviewed"}' as config from puzzle where pgn like '%bain - discovered attack%';
insert into deck_puzzle select (select  id from deck where name = 'Discovered Check'   and config like '%Bain%') as deck, id as puzzle, '{"status":"unreviewed"}' as config from puzzle where pgn like '%bain - discovered check%';
insert into deck_puzzle select (select  id from deck where name = 'Double Attack'      and config like '%Bain%') as deck, id as puzzle, '{"status":"unreviewed"}' as config from puzzle where pgn like '%bain - double attack%';
insert into deck_puzzle select (select  id from deck where name = 'Double Check'       and config like '%Bain%') as deck, id as puzzle, '{"status":"unreviewed"}' as config from puzzle where pgn like '%bain - double check%';
insert into deck_puzzle select (select  id from deck where name = 'Fork'               and config like '%Bain%') as deck, id as puzzle, '{"status":"unreviewed"}' as config from puzzle where pgn like '%bain - fork%';
insert into deck_puzzle select (select  id from deck where name = 'Mixed'              and config like '%Bain%') as deck, id as puzzle, '{"status":"unreviewed"}' as config from puzzle where pgn like '%bain - mixed%';
insert into deck_puzzle select (select  id from deck where name = 'Perpetual Check'    and config like '%Bain%') as deck, id as puzzle, '{"status":"unreviewed"}' as config from puzzle where pgn like '%bain - perpetual check%';
insert into deck_puzzle select (select  id from deck where name = 'Perturbation'       and config like '%Bain%') as deck, id as puzzle, '{"status":"unreviewed"}' as config from puzzle where pgn like '%bain - perturbation%';
insert into deck_puzzle select (select  id from deck where name = 'Pin'                and config like '%Bain%') as deck, id as puzzle, '{"status":"unreviewed"}' as config from puzzle where pgn like '%bain - pin%';
insert into deck_puzzle select (select  id from deck where name = 'Promotion'          and config like '%Bain%') as deck, id as puzzle, '{"status":"unreviewed"}' as config from puzzle where pgn like '%bain - promotion%';
insert into deck_puzzle select (select  id from deck where name = 'Skewer'             and config like '%Bain%') as deck, id as puzzle, '{"status":"unreviewed"}' as config from puzzle where pgn like '%bain - skewer%';
insert into deck_puzzle select (select  id from deck where name = 'Stalemate'          and config like '%Bain%') as deck, id as puzzle, '{"status":"unreviewed"}' as config from puzzle where pgn like '%bain - stalemate%';
insert into deck_puzzle select (select  id from deck where name = 'Zugswang'           and config like '%Bain%') as deck, id as puzzle, '{"status":"unreviewed"}' as config from puzzle where pgn like '%bain - zugzwang%';


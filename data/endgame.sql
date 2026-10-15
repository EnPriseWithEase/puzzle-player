INSERT INTO deck (name, config, folder)
VALUES
    ('All',               '{"puzzle_type":"engine","review_order":"random","retain":"none"}', 'Endgame Sparring');


insert into deck_puzzle select (select  id from deck where name = 'All'                and folder = 'Endgame Sparring') as deck, id as puzzle, '{"status":"unreviewed"}' as folder from puzzle where pgn like '%endgame - %';

INSERT INTO deck (name, config, folder)
VALUES
    ('Classical Game Review', '{"puzzle_type":"candidates","review_order":"random","retain":"none"}', 'Candidate Puzzles');

insert into deck_puzzle select (select  id from deck where name = 'Classical Game Review')      as deck, id as puzzle, '{"status":"unreviewed"}' as config from puzzle where pgn like '%classical - candidates%';

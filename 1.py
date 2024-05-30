def get_adjusted_uma(ranks: list[int], uma: list[int]) -> list[int]:
    """Computes adjusted uma based on ranks

    When ranks are [1,2,3,4], no adjustment is applied.
    When some players have the same rank, (e.g. 1,1,3,4), these players split the uma.
    """
    sorted_ranks = sorted(ranks)
    adjusted_uma = []
    cur_rank = None
    i = 0
    j = 0
    while i < 4:
        j = i
        sum_uma = 0
        while j < 4 and sorted_ranks[j] == sorted_ranks[i]:
            sum_uma += uma[j]
            j += 1
        rst_uma = sum_uma / (j-i)
        adjusted_uma += [rst_uma] * (j-i)
        i = j
    return adjusted_uma

print(get_adjusted_uma([1,1,1,1], [45,5,-15,-35]))

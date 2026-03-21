from core import cache
from clients.openai_client import openai_client
from schemas.candidate import Tier
from schemas.ranking import ApprovalStats, RankingRequest, RankingResponse, TierCounts


async def rank(request: RankingRequest) -> RankingResponse:
    cache_key = cache.make_key('ranking', request.model_dump())
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    ranked_candidates = await openai_client.rank_candidates(
        candidates=request.candidates,
        criteria=request.criteria,
    )

    tier_counts = TierCounts()
    approved_count = 0
    rejected_count = 0

    for candidate in ranked_candidates:
        if candidate.tier == Tier.A:
            tier_counts.A += 1
        elif candidate.tier == Tier.B:
            tier_counts.B += 1
        elif candidate.tier == Tier.C:
            tier_counts.C += 1
        elif candidate.tier == Tier.D:
            tier_counts.D += 1
        elif candidate.tier == Tier.F:
            tier_counts.F += 1

        if candidate.status and candidate.status.approved:
            approved_count += 1
        else:
            rejected_count += 1

    result = RankingResponse(
        candidates=ranked_candidates,
        preview_count=len(ranked_candidates),
        total_count=len(ranked_candidates),
        stats=ApprovalStats(approved=approved_count, rejected=rejected_count),
        tiers=tier_counts,
    )

    cache.set(cache_key, result)
    return result

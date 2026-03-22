import asyncio

from sqlalchemy import func, select

from db.models.role import Role
from db.session import AsyncSessionLocal


async def seed() -> None:
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(func.count()).select_from(Role))
        if result.scalar() == 0:
            session.add(Role(name='Software Engineer'))
            await session.commit()
            print('Seeded default role: Software Engineer')
        else:
            print('Roles already exist, skipping seed')


if __name__ == '__main__':
    asyncio.run(seed())

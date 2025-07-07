import { FullPlayer } from '../../../types/entities';

export interface SquadFullPlayer extends FullPlayer {
    is_on_transfer_list: boolean;
    asking_price: number | null;
}

export type SortKey = keyof SquadFullPlayer | 'stats_pts' | 'stats_ast' | 'stats_reb' | 'stats_stl' | 'stats_blk' | 'stats_fg_pct' | 'stats_three_p_pct';

export type SortConfig = { 
    key: SortKey; 
    direction: 'asc' | 'desc'; 
} | null;

export type SquadViewType = 'overview' | 'skills' | 'stats';

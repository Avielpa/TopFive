import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { SquadFullPlayer } from './squad.types';

const FitnessBar = ({ value }: { value: number }) => (
    <View style={styles.fitnessBarContainer}><View style={[styles.fitnessBar, { width: `${value}%`, backgroundColor: value > 70 ? '#4ADE80' : value > 40 ? '#FACC15' : '#F87171' }]} /></View>
);

export const OverviewRow = ({ player }: { player: SquadFullPlayer }) => (
    <>
        <View style={[styles.cell, {width: 70}]}>
            {player.is_injured ? <FontAwesome5 name="briefcase-medical" size={16} color="#F87171" /> : <Feather name="check-circle" size={16} color="#4ADE80" />}
        </View>
        <View style={[styles.cell, {width: 70}]}>
            {player.is_on_transfer_list && <FontAwesome5 name="exchange-alt" size={16} color="#38BDF8" />}
        </View>
        <Text style={[styles.cell, {width: 90}]}>${(player.market_value / 1000000).toFixed(2)}M</Text>
        <View style={[styles.cell, {width: 80}]}><FitnessBar value={player.fitness} /></View>
        <Text style={[styles.cell, {width: 50}]}>{player.age}</Text>
        <Text style={[styles.cell, {width: 50}]}>{player.contract_years}</Text>
    </>
);

export const SkillsRow = ({ player }: { player: SquadFullPlayer }) => (
    <>
        <Text style={[styles.cell, {width: 60}]}>{player.shooting_2p.toFixed(0)}</Text>
        <Text style={[styles.cell, {width: 60}]}>{player.shooting_3p.toFixed(0)}</Text>
        <Text style={[styles.cell, {width: 60}]}>{player.free_throws.toFixed(0)}</Text>
        <Text style={[styles.cell, {width: 60}]}>{player.passing.toFixed(0)}</Text>
        <Text style={[styles.cell, {width: 60}]}>{player.rebound_def.toFixed(0)}</Text>
        <Text style={[styles.cell, {width: 60}]}>{player.rebound_off.toFixed(0)}</Text>
        <Text style={[styles.cell, {width: 60}]}>{player.blocking.toFixed(0)}</Text>
        <Text style={[styles.cell, {width: 70}]}>{player.defense.toFixed(0)}</Text>
        <Text style={[styles.cell, {width: 60}]}>{player.game_iq.toFixed(0)}</Text>
        <Text style={[styles.cell, {width: 60}]}>{player.speed.toFixed(0)}</Text>
        <Text style={[styles.cell, {width: 60}]}>{player.jumping.toFixed(0)}</Text>
        <Text style={[styles.cell, {width: 60}]}>{player.strength.toFixed(0)}</Text>
        <Text style={[styles.cell, {width: 60}]}>{player.stamina.toFixed(0)}</Text>
    </>
);

export const StatsRow = ({ stats }: { stats: any }) => (
    <>
        <Text style={[styles.cell, {width: 80}]}>{stats.pts ?? '0.0'}</Text>
        <Text style={[styles.cell, {width: 80}]}>{stats.reb ?? '0.0'}</Text>
        <Text style={[styles.cell, {width: 80}]}>{stats.ast ?? '0.0'}</Text>
        <Text style={[styles.cell, {width: 80}]}>{stats.stl ?? '0.0'}</Text>
        <Text style={[styles.cell, {width: 80}]}>{stats.blk ?? '0.0'}</Text>
        <Text style={[styles.cell, {width: 80}]}>{stats.fg_pct ?? '0.0'}%</Text>
        <Text style={[styles.cell, {width: 80}]}>{stats.three_p_pct ?? '0.0'}%</Text>
    </>
);

const styles = StyleSheet.create({
    cell: { color: '#CBD5E1', textAlign: 'center', fontSize: 14, paddingVertical: 14, justifyContent: 'center', alignItems: 'center' },
    fitnessBarContainer: { height: 8, width: '90%', backgroundColor: '#334155', borderRadius: 4, overflow: 'hidden' },
    fitnessBar: { height: '100%', borderRadius: 4 },
});
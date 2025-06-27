import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Dimensions,
  ActivityIndicator,
  Image,
} from 'react-native';
import { getSquad } from '../../services/apiService';
import { FullPlayer } from '../../types/entities';

type Position = 'PG' | 'SG' | 'SF' | 'PF' | 'C';

const SCREEN_WIDTH = Dimensions.get('window').width;
const COURT_WIDTH = SCREEN_WIDTH * 0.4;
const COURT_HEIGHT = COURT_WIDTH * 0.7;

const POSITIONS_COORDS: Record<Position, { x: number; y: number }> = {
  PG: { x: COURT_WIDTH * 0.5, y: COURT_HEIGHT * 0.85 },
  SG: { x: COURT_WIDTH * 0.3, y: COURT_HEIGHT * 0.65 },
  SF: { x: COURT_WIDTH * 0.7, y: COURT_HEIGHT * 0.65 },
  PF: { x: COURT_WIDTH * 0.3, y: COURT_HEIGHT * 0.4 },
  C: { x: COURT_WIDTH * 0.5, y: COURT_HEIGHT * 0.25 },
};

interface Props {
  teamName: string;
  homeJerseyColor: string;
}

export default function TeamManagementScreen({ teamName, homeJerseyColor }: Props) {
  const [squad, setSquad] = useState<FullPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [lineup, setLineup] = useState<Record<Position, FullPlayer | null>>({
    C: null,
    SG: null,
    SF: null,
    PF: null,
    PG: null,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);

  useEffect(() => {
    loadSquad();
  }, []);

  async function loadSquad() {
    setLoading(true);
    try {
      const data = await getSquad();
      setSquad(data);
    } catch (error) {
      console.error('Failed to load squad', error);
    } finally {
      setLoading(false);
    }
  }

  function openModalForPosition(pos: Position) {
    setSelectedPosition(pos);
    setModalVisible(true);
  }

  function assignPlayer(player: FullPlayer) {
    if (!selectedPosition) return;
    setLineup((prev) => ({ ...prev, [selectedPosition]: player }));
    setModalVisible(false);
    setSelectedPosition(null);
  }

  function removePlayer(pos: Position) {
    setLineup((prev) => ({ ...prev, [pos]: null }));
  }

  const availablePlayers = squad.filter(
    (p) => !Object.values(lineup).some((assigned) => assigned?.id === p.id)
  );

  const filteredPlayersForModal = availablePlayers.filter(
    (p) => p.position_primary === selectedPosition
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Team Management - {teamName}</Text>

      <View style={styles.mainContent}>
        {/* Court with image background */}
        <View style={[styles.courtContainer, { width: COURT_WIDTH, height: COURT_HEIGHT }]}>
          <Image
            source={require('../../assets/half_court.png')}
            style={styles.courtImage}
            resizeMode="contain"
          />
          {(Object.keys(POSITIONS_COORDS) as Position[]).map((pos) => {
            const player = lineup[pos];
            const { x, y } = POSITIONS_COORDS[pos];
            return (
              <TouchableOpacity
                key={pos}
                activeOpacity={0.7}
                onPress={() => openModalForPosition(pos)}
                style={[
                  styles.playerCircle,
                  {
                    left: x - 25,
                    top: y - 25,
                    backgroundColor: player ? homeJerseyColor : '#bbb',
                    zIndex: 10,
                  },
                ]}
              >
                {player ? (
                  <>
                    <Text style={styles.jerseyInitials}>
                      {player.first_name[0].toUpperCase()}
                      {player.last_name[0].toUpperCase()}
                    </Text>
                    <Text style={styles.jerseyPosition}>{pos}</Text>
                  </>
                ) : (
                  <Text style={styles.emptyPositionText}>{pos}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Squad list */}
        <View style={styles.squadContainer}>
          <Text style={styles.squadTitle}>Available Players</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#1e40af" />
          ) : availablePlayers.length === 0 ? (
            <Text style={styles.noPlayersText}>No players available for assignment</Text>
          ) : (
            <FlatList
              data={availablePlayers}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.playerItem}>
                  <Text style={styles.playerNameList}>
                    {item.first_name} {item.last_name}
                  </Text>
                  <Text style={styles.playerPosition}>Position: {item.position_primary}</Text>
                  <Text style={styles.playerRating}>Rating: {item.rating}</Text>
                </View>
              )}
            />
          )}
        </View>
      </View>

      {/* Modal for selecting player */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Player for Position: {selectedPosition}</Text>

            <FlatList
              data={filteredPlayersForModal}
              keyExtractor={(item) => item.id.toString()}
              ListEmptyComponent={<Text style={{ padding: 20 }}>No players in this position</Text>}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => assignPlayer(item)}
                  style={styles.modalPlayerItem}
                >
                  <Text style={styles.modalPlayerName}>
                    {item.first_name} {item.last_name} (Rating: {item.rating})
                  </Text>
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity
              style={styles.modalCancelBtn}
              onPress={() => setModalVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1e40af',
    textAlign: 'center',
    marginBottom: 12,
  },
  mainContent: {
    flexDirection: 'row',
    flex: 1,
    paddingHorizontal: 5,
  },
  courtContainer: {
    backgroundColor: 'transparent',
    borderRadius: 20,
    marginRight: 12,
    position: 'relative',
  },
  courtImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  playerCircle: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  jerseyInitials: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  jerseyPosition: {
    fontSize: 12,
    color: '#ddd',
    fontWeight: '600',
    marginTop: -3,
  },
  emptyPositionText: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
  },
  squadContainer: {
    flex: 0.45,
    borderLeftWidth: 2,
    borderColor: '#ddd',
    paddingLeft: 10,
    marginLeft:100
  },
  squadTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8,
    textAlign: 'center',
  },
  noPlayersText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 30,
  },
  playerItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    marginBottom: 4,
  },
  playerNameList: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  playerPosition: {
    fontSize: 14,
    color: '#555',
  },
  playerRating: {
    fontSize: 14,
    color: '#555',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    maxHeight: '75%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#1e40af',
  },
  modalPlayerItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  modalPlayerName: {
    fontSize: 16,
  },
  modalCancelBtn: {
    marginTop: 20,
    backgroundColor: '#1e40af',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
























































// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Image,
//   ImageBackground,
//   SafeAreaView,
//   ScrollView,
//   Platform,
//   Modal,
//   Pressable,
// } from 'react-native';
// import Animated, { FadeInDown } from 'react-native-reanimated';
// import { FullPlayer } from '@/types/entities';
// import { getSquad } from '@/services/apiService';

// const SquadScreen = () => {
//   const [players, setPlayers] = useState<FullPlayer[]>([]);
//   const [lineup, setLineup] = useState<FullPlayer[]>([]);
//   const [bench, setBench] = useState<FullPlayer[]>([]);
//   const [reserves, setReserves] = useState<FullPlayer[]>([]);
//   const [selectedPlayer, setSelectedPlayer] = useState<FullPlayer | null>(null);

//   useEffect(() => {
//     const fetchPlayers = async () => {
//       try {
//         const response = await getSquad();
//         const data = response;

//         const positions = ['PG', 'SG', 'SF', 'PF', 'C'];
//         const playersByPosition: Record<string, FullPlayer[]> = {};

//         positions.forEach(pos => {
//           playersByPosition[pos] = data
//             .filter(player => player.position_primary === pos)
//             .sort((a, b) => b.rating - a.rating);
//         });

//         const lineup: FullPlayer[] = positions.map(pos => {
//           const playersInPos = playersByPosition[pos];
//           if (playersInPos && playersInPos.length > 0) {
//             return playersInPos[0];
//           }
//           return null;
//         }).filter((p): p is FullPlayer => p !== null);

//         const lineupIds = new Set(lineup.map(p => p.id));

//         const remainingPlayers = data
//           .filter(p => !lineupIds.has(p.id))
//           .sort((a, b) => b.rating - a.rating);

//         const bench = remainingPlayers.slice(0, 5);
//         const reserves = remainingPlayers.slice(5);

//         setLineup(lineup);
//         setBench(bench);
//         setReserves(reserves);
//         setPlayers(data);
//       } catch (error) {
//         console.error('Error fetching players:', error);
//       }
//     };

//     fetchPlayers();
//   }, []);

//   const renderPlayerCard = (player: FullPlayer) => (
//     <Pressable key={player.id} onPress={() => setSelectedPlayer(player)} style={styles.playerCard}>
//       <Image
//         source={player.photo ? { uri: player.photo } : require('@/assets/default_player.png')}
//         style={styles.playerImage}
//       />
//       <Text style={styles.playerName}>
//         {player.first_name[0]}. {player.last_name}
//       </Text>
//       <Text style={styles.playerPosition}>{player.position_primary}</Text>
//     </Pressable>
//   );

//   const positionStyles: Record<string, { top: `${number}%`; left: `${number}%` }> = {
//     PG: { top: '75%', left: '45%' },
//     C: { top: '43%', left: '30%' },
//     SF: { top: '75%', left: '65%' },
//     PF: { top: '90%', left: '30%' },
//     SG: { top: '37%', left: '75%' },
//     DEFAULT: { top: '50%', left: '50%' },
//   };

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <View style={styles.container}>
//         <View style={styles.reserveSection}>
//           <ScrollView
//             contentContainerStyle={styles.reserveList}
//             showsVerticalScrollIndicator={false}
//           >
//             <Text style={styles.sectionTitle}>Reserves</Text>
//             {reserves.map(renderPlayerCard)}
//           </ScrollView>
//         </View>

//         <View style={styles.mainSection}>
//           <ImageBackground
//             source={require('@/assets/basketball-court.png')}
//             style={styles.courtBackground}
//             imageStyle={styles.courtImage}
//           >
//             <View style={styles.lineupOverlay}>
//               {lineup.map((player) => {
//                 const pos = positionStyles[player.position_primary] || positionStyles.DEFAULT;
//                 return (
//                   <Animated.View
//                     key={player.id}
//                     entering={FadeInDown.duration(600)}
//                     style={[styles.playerCardAnimated, { top: pos.top, left: pos.left }]}
//                   >
//                     {renderPlayerCard(player)}
//                   </Animated.View>
//                 );
//               })}
//             </View>
//           </ImageBackground>

//           <View style={styles.benchSection}>
//             <Text style={styles.sectionTitle}>Bench</Text>
//             <View style={styles.benchRow}>
//               {bench.map(renderPlayerCard)}
//             </View>
//           </View>
//         </View>

//         <Modal
//           visible={!!selectedPlayer}
//           transparent
//           animationType="fade"
//           onRequestClose={() => setSelectedPlayer(null)}
//         >
//           <View style={styles.modalOverlay}>
//             <View style={styles.modalContent}>
//               <Text style={styles.modalTitle}>Player Info</Text>
//               {selectedPlayer && (
//                 <>
//                   <Text style={styles.modalText}>
//                     {selectedPlayer.first_name} {selectedPlayer.last_name}
//                   </Text>
//                   <Text style={styles.modalText}>Position: {selectedPlayer.position_primary}</Text>
//                   <Text style={styles.modalText}>Rating: {selectedPlayer.rating}</Text>
//                 </>
//               )}
//               <Pressable onPress={() => setSelectedPlayer(null)} style={styles.modalButton}>
//                 <Text style={styles.modalButtonText}>Close</Text>
//               </Pressable>
//             </View>
//           </View>
//         </Modal>
//       </View>
//     </SafeAreaView>
//   );
// };

// export default SquadScreen;

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#0F172A',
//     paddingTop: Platform.OS === 'android' ? 25 : 0,
//   },
//   container: {
//     flex: 1,
//     flexDirection: 'row',
//     backgroundColor: '#0F172A',
//   },
//   reserveSection: {
//     width: '15%',
//     backgroundColor: '#1E293B',
//     paddingHorizontal: 6,
//     marginTop: 10,
//     alignItems: 'center',
//   },
//   reserveList: {
//     paddingTop: 10,
//     paddingBottom: 20,
//     alignItems: 'center',
//   },
//   mainSection: {
//     width: '75%',
//     justifyContent: 'space-between',
//     paddingVertical: 6,
//   },
//   sectionTitle: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: '#FFA726',
//     marginBottom: 8,
//     textAlign: 'center',
//   },
//   playerCard: {
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   playerImage: {
//     width: 50,
//     height: 30,
//     borderRadius: 25,
//     borderWidth: 1,
//     borderColor: '#FFF',
//   },
//   playerName: {
//     color: 'yellow',
//     fontSize: 12,
//     marginTop: 4,
//     textAlign: 'center',
//   },
//   playerPosition: {
//     color: '#94A3B8',
//     fontSize: 10,
//   },
//   courtBackground: {
//     width: '240%',
//     aspectRatio: 1.6,
//     maxHeight: 190,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingTop: 10,
//     paddingBottom: 20,
//     position: 'relative',
//   },
//   courtImage: {
//     borderRadius: 12,
//   },
//   lineupOverlay: {
//     ...StyleSheet.absoluteFillObject,
//   },
//   playerCardAnimated: {
//     position: 'absolute',
//     alignItems: 'center',
//     transform: [{ translateX: -25 }],
//   },
//   benchSection: {
//     paddingTop: 1,
//     alignItems: 'center',
//   },
//   benchRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     flexWrap: 'wrap',
//     width: '100%',
//     paddingHorizontal: 10,
//     paddingLeft: 200,
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContent: {
//     backgroundColor: '#1E293B',
//     borderRadius: 10,
//     padding: 20,
//     width: '80%',
//     alignItems: 'center',
//   },
//   modalTitle: {
//     fontSize: 18,
//     color: '#FFA726',
//     marginBottom: 10,
//   },
//   modalText: {
//     color: '#fff',
//     fontSize: 14,
//     marginBottom: 6,
//   },
//   modalButton: {
//     marginTop: 15,
//     backgroundColor: '#FFA726',
//     paddingVertical: 8,
//     paddingHorizontal: 20,
//     borderRadius: 6,
//   },
//   modalButtonText: {
//     color: '#1E293B',
//     fontWeight: 'bold',
//   },
// });










































// // ==============================================================================
// // File: frontend/app/(tabs)/squad.tsx (FIXED)
// // Description: The new screen to display and manage the team's squad.
// // ==============================================================================

// import React, { useEffect, useState, useMemo } from 'react';
// import { View, Text, StyleSheet, FlatList, ActivityIndicator, SafeAreaView, TouchableOpacity } from 'react-native';
// import { FullPlayer } from '../../types/entities';
// import { getSquad } from '../../services/apiService';
// import { useAuth } from '../../context/AuthContext';
// import { Feather } from '@expo/vector-icons';

// type SortKey = keyof FullPlayer;
// type SortDirection = 'asc' | 'desc';

// const SquadScreen = () => {
//     const { isLoading: isAuthLoading } = useAuth();
//     const [players, setPlayers] = useState<FullPlayer[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection } | null>({
//         key: 'rating',
//         direction: 'desc',
//     });

//     useEffect(() => {
//         if (!isAuthLoading) {
//             const fetchSquad = async () => {
//                 setLoading(true);
//                 try {
//                     const data = await getSquad();
//                     setPlayers(data);
//                 } catch (error) {
//                     console.error("Failed to fetch squad", error);
//                 } finally {
//                     setLoading(false);
//                 }
//             };
//             fetchSquad();
//         }
//     }, [isAuthLoading]);

//     const sortedPlayers = useMemo(() => {
//         if (!sortConfig) return players;

//         return [...players].sort((a, b) => {
//             const key = sortConfig.key;
//             const direction = sortConfig.direction;

//             const aVal = a[key];
//             const bVal = b[key];

//             if (aVal == null || bVal == null) return 0;

//             if (aVal < bVal) return direction === 'asc' ? -1 : 1;
//             if (aVal > bVal) return direction === 'asc' ? 1 : -1;
//             return 0;
//         });
//     }, [players, sortConfig]);

//     const requestSort = (key: SortKey) => {
//         let direction: SortDirection = 'desc';
//         if (sortConfig && sortConfig.key === key && sortConfig.direction === 'desc') {
//             direction = 'asc';
//         }
//         setSortConfig({ key, direction });
//     };

//     const renderHeader = () => (
//         <View style={styles.headerRow}>
//             <SortableHeader title="Player" sortKey="last_name" requestSort={requestSort} sortConfig={sortConfig} style={{ flex: 3 }} />
//             <SortableHeader title="Pos" sortKey="position_primary" requestSort={requestSort} sortConfig={sortConfig} />
//             <SortableHeader title="Age" sortKey="age" requestSort={requestSort} sortConfig={sortConfig} />
//             <SortableHeader title="Rat" sortKey="rating" requestSort={requestSort} sortConfig={sortConfig} />
//             <SortableHeader title="Yrs" sortKey="contract_years" requestSort={requestSort} sortConfig={sortConfig} />
//         </View>
//     );

//     const renderPlayerRow = ({ item }: { item: FullPlayer }) => (
//         <TouchableOpacity onPress={() => console.log('Player pressed:', item.id)}>
//             <View style={styles.playerRow}>
//                 <Text style={[styles.cell, { flex: 3, textAlign: 'left' }]}>{`${item.first_name.charAt(0)}. ${item.last_name}`}</Text>
//                 <Text style={styles.cell}>{item.position_primary}</Text>
//                 <Text style={styles.cell}>{item.age}</Text>
//                 <Text style={[styles.cell, styles.ratingCell]}>{item.rating}</Text>
//                 <Text style={styles.cell}>{item.contract_years}</Text>
//             </View>
//         </TouchableOpacity>
//     );

//     if (isAuthLoading || loading) {
//         return (
//             <View style={styles.centerContainer}>
//                 <ActivityIndicator size="large" color="#FFA726" />
//                 <Text style={styles.loadingText}>Loading Squad...</Text>
//             </View>
//         );
//     }

//     return (
//         <SafeAreaView style={styles.container}>
//             <Text style={styles.title}>Team Squad</Text>
//             <View style={styles.tableContainer}>
//                 {renderHeader()}
//                 <FlatList
//                     data={sortedPlayers}
//                     keyExtractor={(item) => item.id.toString()}
//                     renderItem={renderPlayerRow}
//                     contentContainerStyle={{ paddingBottom: 120 }}
//                 />
//             </View>
//         </SafeAreaView>
//     );
// };

// const SortableHeader = ({ title, sortKey, requestSort, sortConfig, style }: any) => {
//     const iconName = sortConfig?.direction === 'asc' ? 'chevron-up' : 'chevron-down';
//     const isActive = sortConfig?.key === sortKey;

//     return (
//         <TouchableOpacity style={[styles.headerCell, style]} onPress={() => requestSort(sortKey)}>
//             <Text style={styles.headerText}>{title}</Text>
//             {isActive && <Feather name={iconName} size={16} color="#FFA726" />}
//         </TouchableOpacity>
//     );
// };

// const styles = StyleSheet.create({
//     container: { flex: 1, backgroundColor: '#0F172A', paddingTop: 40 },
//     centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A' },
//     title: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center', marginBottom: 20 },
//     loadingText: { marginTop: 10, color: '#94A3B8', fontSize: 16 },
//     tableContainer: { marginHorizontal: 10 },
//     headerRow: { flexDirection: 'row', backgroundColor: '#1E293B', paddingVertical: 14, paddingHorizontal: 10, borderTopLeftRadius: 8, borderTopRightRadius: 8 },
//     headerCell: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'center' },
//     headerText: { color: '#FFA726', fontWeight: 'bold', fontSize: 15, marginRight: 4 },
//     playerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#334155', backgroundColor: '#1E293B' },
//     cell: { color: '#CBD5E1', textAlign: 'center', flex: 1, fontSize: 14 },
//     ratingCell: { fontWeight: 'bold', color: '#FFA726' },
// });

// export default SquadScreen;


